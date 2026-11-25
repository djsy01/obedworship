const { TextDecoder } = require('node:util');
const sax = require('sax');

const svgMime = 'image/svg+xml';
const maxSvgSize = 8 * 1024 * 1024;
const namespace = 'http://www.w3.org/2000/svg';
const blocked = new Set(['script', 'foreignobject', 'animate', 'animatemotion', 'animatetransform', 'set']);

function looksLikeXml(buffer) {
    return buffer.subarray(0, 4096).toString('utf8').trimStart().startsWith('<');
}

function isStaticSvg(buffer) {
    if (buffer.length > maxSvgSize || !looksLikeXml(buffer)) return false;
    const parser = sax.parser(true, { xmlns: true, strictEntities: true });
    let root = false;
    let valid = true;
    let declaration = false;
    parser.ondoctype = () => { valid = false; };
    parser.onprocessinginstruction = ({ name, body }) => {
        const encoding = /\bencoding\s*=\s*(['"])([^'"]+)\1/i.exec(body)?.[2];
        if (root || declaration || name !== 'xml' || (encoding && encoding.toLowerCase() !== 'utf-8')) valid = false;
        declaration = true;
    };
    parser.onopentag = tag => {
        if (!root) {
            root = true;
            valid &&= tag.local === 'svg' && tag.uri === namespace;
        }
        if (blocked.has(tag.local.toLowerCase())) valid = false;
        for (const attribute of Object.values(tag.attributes)) {
            const name = attribute.local.toLowerCase();
            if (name.startsWith('on') || (name === 'href' && !attribute.value.trim().startsWith('#'))) {
                valid = false;
            }
        }
    };
    try {
        parser.write(new TextDecoder('utf-8', { fatal: true }).decode(buffer)).close();
        return root && valid;
    } catch {
        return false;
    }
}

module.exports = { isStaticSvg, looksLikeXml, maxSvgSize, svgMime };
