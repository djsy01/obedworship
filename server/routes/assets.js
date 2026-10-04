const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage'); // npm install @google-cloud/storage 필요

// 메모리에 파일을 임시 저장 (GCS로 스트리밍 업로드하기 위함)
const upload = multer({ storage: multer.memoryStorage() });

// Google Cloud Storage 설정
// 실제 운영 시 process.env.GOOGLE_APPLICATION_CREDENTIALS 환경 변수에 서비스 계정 키 경로가 세팅되어야 합니다.
const gcs = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || 'obedworship-assets-bucket';
const bucket = gcs.bucket(bucketName);

/**
 * MimeType을 기반으로 asset_type을 추론하는 헬퍼 함수
 */
function getAssetType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
}

// =================================
// 1. [GET] 전체 에셋 및 카테고리 필터 조회 API
// =================================
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM assets';
        const params = [];

        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }

        const [assets] = await db.query(query, params);
        res.status(200).json(assets);
    } catch (error) {
        console.error('에셋 목록 조회 에러:', error);
        res.status(500).json({ message: '에셋 데이터를 불러오지 못했습니다.' });
    }
});

// =================================
// 2. [GET] 고유 키(key)로 에셋 조회 API
// =================================
router.get('/key/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const [assets] = await db.query('SELECT * FROM assets WHERE asset_key = ?', [key]);
        
        if (assets.length === 0) {
            return res.status(404).json({ message: '해당 키를 가진 에셋을 찾을 수 없습니다.' });
        }
        res.status(200).json(assets[0]);
    } catch (error) {
        console.error('에셋 키 조회 에러:', error);
        res.status(500).json({ message: '에셋 정보를 불러오는 중 에러가 발생했습니다.' });
    }
});

// =================================
// 3. [GET] ID로 단일 에셋 조회 API
// =================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [assets] = await db.query('SELECT * FROM assets WHERE id = ?', [id]);
        
        if (assets.length === 0) {
            return res.status(404).json({ message: '해당 에셋을 찾을 수 없습니다.' });
        }
        res.status(200).json(assets[0]);
    } catch (error) {
        console.error('에셋 단일 조회 에러:', error);
        res.status(500).json({ message: '에셋 정보를 불러오는 중 에러가 발생했습니다.' });
    }
});

// =================================
// 4. [POST] 새 에셋 레코드 생성 API (메타데이터만)
// =================================
router.post('/', async (req, res) => {
    try {
        const { asset_key, asset_type, category, file_url, file_name, file_size, mime_type, title, description, display_order, is_active } = req.body;
        
        const insertQuery = `
            INSERT INTO assets 
            (asset_key, asset_type, category, file_url, file_name, file_size, mime_type, title, description, display_order, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [asset_key, asset_type, category, file_url, file_name, file_size, mime_type, title, description, display_order || 0, is_active ?? true];
        
        const [result] = await db.query(insertQuery, values);
        const [newAsset] = await db.query('SELECT * FROM assets WHERE id = ?', [result.insertId]);
        
        res.status(201).json(newAsset[0]);
    } catch (error) {
        console.error('에셋 생성 에러:', error);
        res.status(500).json({ message: '에셋 생성 중 에러가 발생했습니다.' });
    }
});

// =================================
// 5. [PATCH] ID로 에셋 수정 API
// =================================
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const keys = Object.keys(updates);
        
        if (keys.length === 0) return res.status(400).json({ message: '수정할 데이터가 없습니다.' });

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), id];

        await db.query(`UPDATE assets SET ${setClause} WHERE id = ?`, values);
        
        const [updatedAsset] = await db.query('SELECT * FROM assets WHERE id = ?', [id]);
        res.status(200).json(updatedAsset[0]);
    } catch (error) {
        console.error('에셋 수정 에러:', error);
        res.status(500).json({ message: '에셋 수정 중 에러가 발생했습니다.' });
    }
});

// =================================
// 6. [PATCH] 키(key)로 에셋 수정 API
// =================================
router.patch('/key/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const updates = req.body;
        const keysObj = Object.keys(updates);
        
        if (keysObj.length === 0) return res.status(400).json({ message: '수정할 데이터가 없습니다.' });

        const setClause = keysObj.map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), key];

        await db.query(`UPDATE assets SET ${setClause} WHERE asset_key = ?`, values);
        
        const [updatedAsset] = await db.query('SELECT * FROM assets WHERE asset_key = ?', [key]);
        res.status(200).json(updatedAsset[0]);
    } catch (error) {
        console.error('키 기반 에셋 수정 에러:', error);
        res.status(500).json({ message: '에셋 수정 중 에러가 발생했습니다.' });
    }
});

// =================================
// 7. [DELETE] 에셋 삭제 API
// =================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // DB에서 레코드 조회
        const [assets] = await db.query('SELECT * FROM assets WHERE id = ?', [id]);
        if (assets.length > 0 && assets[0].file_name) {
            // GCS에서도 실제 파일 삭제 시도
            try {
                await bucket.file(assets[0].file_name).delete();
            } catch (gcsError) {
                console.error('GCS 파일 삭제 실패 (무시됨):', gcsError.message);
            }
        }

        await db.query('DELETE FROM assets WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('에셋 삭제 에러:', error);
        res.status(500).json({ message: '에셋 삭제 중 에러가 발생했습니다.' });
    }
});

// =================================
// 8. [POST] 파일 업로드 및 자동 레코드 처리 API
// =================================
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: '파일이 제공되지 않았습니다.' });

        const { asset_key, category, title, description } = req.body;
        if (!asset_key || !category) return res.status(400).json({ message: 'asset_key와 category는 필수입니다.' });

        const originalName = req.file.originalname;
        const gcsFileName = `${Date.now()}-${originalName}`;
        const blob = bucket.file(gcsFileName);
        
        // 1. 기존 동일한 asset_key가 있는지 확인
        const [existingAssets] = await db.query('SELECT * FROM assets WHERE asset_key = ?', [asset_key]);
        const exists = existingAssets.length > 0;

        if (exists && existingAssets[0].file_name) {
            // 명세: 기존 키 존재 시 GCS 파일 삭제
            try {
                await bucket.file(existingAssets[0].file_name).delete();
            } catch (err) {
                console.log('기존 파일 삭제 무시됨:', err.message);
            }
        }

        // 2. 새 파일을 GCS에 업로드
        const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: req.file.mimetype,
        });

        blobStream.on('error', (err) => {
            console.error('GCS 업로드 에러:', err);
            res.status(500).json({ message: '파일 업로드 실패' });
        });

        blobStream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
            const assetType = getAssetType(req.file.mimetype);

            const fileData = {
                file_url: publicUrl,
                file_name: blob.name,
                file_size: req.file.size,
                mime_type: req.file.mimetype,
                asset_type: assetType,
                category,
                title: title || originalName,
                description: description || ''
            };

            try {
                if (exists) {
                    // 명세: 존재하면 레코드 덮어쓰기 (Update)[cite: 3]
                    const id = existingAssets[0].id;
                    const setClause = Object.keys(fileData).map(k => `${k} = ?`).join(', ');
                    const values = [...Object.values(fileData), id];
                    
                    await db.query(`UPDATE assets SET ${setClause} WHERE id = ?`, values);
                    const [updated] = await db.query('SELECT * FROM assets WHERE id = ?', [id]);
                    res.status(200).json(updated[0]);
                } else {
                    // 명세: 존재하지 않으면 새로 생성 (Create)[cite: 3]
                    const insertData = { ...fileData, asset_key };
                    const keys = Object.keys(insertData).join(', ');
                    const placeholders = Object.keys(insertData).map(() => '?').join(', ');
                    const values = Object.values(insertData);

                    const [result] = await db.query(`INSERT INTO assets (${keys}) VALUES (${placeholders})`, values);
                    const [created] = await db.query('SELECT * FROM assets WHERE id = ?', [result.insertId]);
                    res.status(201).json(created[0]);
                }
            } catch (dbError) {
                console.error('DB 저장 에러:', dbError);
                res.status(500).json({ message: '데이터베이스 기록 실패' });
            }
        });

        // 버퍼 스트림 실행
        blobStream.end(req.file.buffer);

    } catch (error) {
        console.error('업로드 로직 에러:', error);
        res.status(500).json({ message: '파일 업로드 중 서버 에러가 발생했습니다.' });
    }
});

module.exports = router;