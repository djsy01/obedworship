<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">OBED Worship 비전</h1>
          <p class="section-subtitle">
            순종과 경외로 주님과 소통하는 예배 공동체의 비전과 팀원들을 소개합니다.
          </p>
        </div>
      </div>

      <div class="bible-verse">
        <blockquote>
          <p>
            "너희는 너희 하나님 여호와를 순종하며, 그를 경외하며 그 명령을 지키며<br />
            그 목소리를 청종하며, 그를 섬기며 그에게 부종하고"
          </p>
          <cite>- 신명기 13:4 -</cite>
        </blockquote>
      </div>

      <div class="team-description">
        <div class="highlight-box">
          빠르게 변화해가는 세상 속에서 주님을 향해 두려움을 내려놓고 목소리로 주님과 소통하는 찬양팀
        </div>
        <div class="highlight-box">
          청중들과 함께 소통하며 예배의 중심이 주님께 내려놓는 찬양팀
        </div>
        <div class="highlight-box">
          집회를 준비하는 과정에서 역할에 따라 무엇이 중요한지 고민하며, 다음 세대를 위로하고 함께 성장하기 위함
        </div>
        <div class="highlight-box">
          주님의 사랑을 잊고 살아가는 사람들에게 "너희는 잊어도 그리스도이신 주님께서는 아직도 우릴 찾고 있다"는 것을 다시금 깨닫게 하기 위해
        </div>
      </div>

      <div class="team-member-section">
        <h2 class="section-title-sub">팀원 소개</h2>

        <div class="position-filter">
          <button
            class="filter-btn"
            :class="{ active: filter === 'all' }"
            @click="handleMainFilter('all')"
          >
            All
          </button>
          <button
            class="filter-btn"
            :class="{ active: filter === 'leader' }"
            @click="handleMainFilter('leader')"
          >
            Leader
          </button>
          <button
            class="filter-btn"
            :class="{ active: filter === 'worship' }"
            @click="handleMainFilter('worship')"
          >
            Worship
          </button>
          <button
            class="filter-btn"
            :class="{ active: filter === 'step' }"
            @click="handleMainFilter('step')"
          >
            Step
          </button>
        </div>

        <div v-if="filter === 'worship'" class="worship-filters">
          <button
            class="filter-btn small"
            :class="{ active: worshipFilter === '' }"
            @click="worshipFilter = ''"
          >
            Worship All
          </button>
          <button
            class="filter-btn small"
            :class="{ active: worshipFilter === 'Vocal' }"
            @click="worshipFilter = 'Vocal'"
          >
            Vocal
          </button>
          <button
            class="filter-btn small"
            :class="{ active: worshipFilter === 'Piano' }"
            @click="worshipFilter = 'Piano'"
          >
            Piano
          </button>
          <button
            class="filter-btn small"
            :class="{ active: worshipFilter === 'Guitar' }"
            @click="worshipFilter = 'Guitar'"
          >
            Guitar
          </button>
          <button
            class="filter-btn small"
            :class="{ active: worshipFilter === 'Drum' }"
            @click="worshipFilter = 'Drum'"
          >
            Drum
          </button>
        </div>

        <div v-if="filter === 'step'" class="step-filters">
          <button
            class="filter-btn small"
            :class="{ active: stepFilter === '' }"
            @click="stepFilter = ''"
          >
            Step All
          </button>
          <button
            class="filter-btn small"
            :class="{ active: stepFilter === '홍보팀' }"
            @click="stepFilter = '홍보팀'"
          >
            홍보팀
          </button>
          <button
            class="filter-btn small"
            :class="{ active: stepFilter === '영상팀' }"
            @click="stepFilter = '영상팀'"
          >
            영상팀
          </button>
          <button
            class="filter-btn small"
            :class="{ active: stepFilter === '무대팀' }"
            @click="stepFilter = '무대팀'"
          >
            무대팀
          </button>
        </div>

        <div class="member-grid">
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="member-card"
          >
            <img
              :src="member.photo_url"
              :alt="member.name"
              class="member-photo"
            />
            <div class="member-info">
              <h3 class="member-name">{{ member.name }}</h3>
              
              <span class="affiliation-badge">{{ member.affiliation }}</span>
              
              <div v-if="member.roles.length > 0" class="member-roles">
                <span v-for="role in member.roles" :key="role" class="role-badge">
                  {{ role }}
                </span>
              </div>
              
              <div class="member-positions">
                <template v-if="filter === 'all'">
                  <span v-for="pos in member.worship_positions" :key="pos" class="position-badge worship">
                    {{ pos }}
                  </span>
                  <span v-for="pos in member.step_positions" :key="pos" class="position-badge step">
                    {{ pos }}
                  </span>
                </template>
                
                <template v-else-if="filter === 'worship'">
                  <span v-for="pos in member.worship_positions" :key="pos" class="position-badge worship">
                    {{ pos }}
                  </span>
                </template>
                
                <template v-else-if="filter === 'step'">
                  <span v-for="pos in member.step_positions" :key="pos" class="position-badge step">
                    {{ pos }}
                  </span>
                </template>
              </div>
              
              <div class="social-links">
                <a
                  v-if="member.instagram_url"
                  :href="member.instagram_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="icon-link"
                  title="Instagram"
                >
                  <img :src="instagramIcon" alt="Instagram" class="social-icon" />
                </a>
                <a
                  v-if="member.youtube_url"
                  :href="member.youtube_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="icon-link"
                  title="YouTube"
                >
                  <img :src="youtubeIcon" alt="YouTube" class="social-icon" />
                </a>
              </div>
            </div>
          </div>

          <p v-if="filteredMembers.length === 0" class="empty-text">
            조건에 맞는 팀원이 없습니다.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import '../styles/Vision.css'
import logo from '@/assets/image/LOGO.JPG'
import photoGiin from '@/assets/people/Giin.jpeg'
import photoMijung from '@/assets/people/mijung.jpeg'
import photoInho from '@/assets/people/inho.JPG'
import photoDrumWook from '@/assets/people/DrumWook.jpeg'
import photoJungsuk from '@/assets/people/jungsuk.jpeg'
import photoOnnew from '@/assets/people/onnew.jpeg'
import photoJongeon from '@/assets/people/Jongeon.jpeg'
import photoYesol from '@/assets/people/yesol.jpeg'
import instagramIcon from '@/assets/icons/Instargram.png'
import youtubeIcon from '@/assets/icons/youtube.png'

type Member = {
  id: number
  name: string
  affiliation: string
  photo_url: string
  instagram_url: string | null
  youtube_url: string | null
  roles: string[]
  worship_positions: string[]
  step_positions: string[]
  description: string
}

const filter = ref<'all' | 'leader' | 'worship' | 'step'>('all')
const worshipFilter = ref<string>('')
const stepFilter = ref<string>('')

const members = ref<Member[]>([
  {
    id: 1,
    name: '박훈 목사',
    affiliation: '목사',
    photo_url: logo,
    instagram_url: 'https://www.instagram.com/holyforest.jpg',
    youtube_url: null,
    roles: ['Pastor'],
    worship_positions: [],
    step_positions: [],
    description: 'OBED 영적 총감독, 초청 간사/목사 섭외'
  },
  {
    id: 2,
    name: '이기인 장로',
    affiliation: '장년부',
    photo_url: photoGiin,
    instagram_url: 'https://www.instagram.com/somanja59',
    youtube_url: null,
    roles: ['Elder'],
    worship_positions: ['Acoustic Guitar'],
    step_positions: [],
    description: '찬양위원회, 어쿠스틱'
  },
  {
    id: 3,
    name: '김미정',
    affiliation: '장년부',
    photo_url: photoMijung,
    instagram_url: 'https://www.instagram.com/cat0925_',
    youtube_url: null,
    roles: ['Accounting'],
    worship_positions: [],
    step_positions: [],
    description: '재정 담당, 예배 인력 섭외, 운영 지원'
  },
  {
    id: 4,
    name: '엄인호',
    affiliation: '청년부',
    photo_url: photoInho,
    instagram_url: 'https://www.instagram.com/djsy_01',
    youtube_url: 'https://www.youtube.com/@djsy01',
    roles: ['Worship Team Leader', 'Lead Singer'],
    worship_positions: ['Vocal', 'Acoustic Guitar', 'Lead Guitar'],
    step_positions: ['Video Editor', 'Live Engineer', 'Mix Engineer', 'Music Producer'],
    description: 'OBED 팀장 + 현 인도자 + 어쿠스틱, 무대 구상, 프리프로덕션, 음향 설계, 후반 믹싱 → OBED 음악·예배·음향 디렉터'
  },
  {
    id: 5,
    name: '박상욱',
    affiliation: '청년부',
    photo_url: photoDrumWook,
    instagram_url: 'https://www.instagram.com/drum_wook02',
    youtube_url: 'https://youtube.com/channel/UC_vv_fm_8e3O8xTb5TbPKrg',
    roles: ['Media Leader'],
    worship_positions: ['Drum'],
    step_positions: ['Camera Operator', 'Video Editor', 'Live Engineer', 'Mix Engineer'],
    description: 'OBED 부팀장(세션팀장) + 드럼 or 영상팀(촬영/편집/믹싱) + 프리프로덕션 보조 + 유튜브 채널 관리 → Music + Media 테크 리더'
  },
  {
    id: 6,
    name: '전예원',
    affiliation: '청년부',
    photo_url: logo,
    instagram_url: 'https://www.instagram.com/winnie_the_ron_02',
    youtube_url: null,
    roles: [],
    worship_positions: ['Vocal'],
    step_positions: ['Prayer Team'],
    description: '기도팀 + 싱어'
  },
  {
    id: 7,
    name: '김온유',
    affiliation: '청년부',
    photo_url: photoOnnew,
    instagram_url: 'https://www.instagram.com/onyourmusic',
    youtube_url: 'https://www.youtube.com/@onyourmusic',
    roles: [],
    worship_positions: ['Vocal'],
    step_positions: ['Audio Setup'],
    description: '무대팀 + 싱어'
  },
  {
    id: 8,
    name: '김정석',
    affiliation: '청년부',
    photo_url: photoJungsuk,
    instagram_url: 'https://www.instagram.com/_kjs_1127',
    youtube_url: null,
    roles: [],
    worship_positions: ['Bass Guitar'],
    step_positions: ['Lighting Operator'],
    description: '조명 + 베이스'
  },
  {
    id: 9,
    name: '마승빈',
    affiliation: '고등부',
    photo_url: logo,
    instagram_url: 'https://www.instagram.com/z.sbbxn_',
    youtube_url: null,
    roles: [],
    worship_positions: ['Drum'],
    step_positions: ['Planning Team'],
    description: '홍보팀 + 드럼'
  },
  {
    id: 10,
    name: '박소라',
    affiliation: '장년부',
    photo_url: logo,
    instagram_url: null,
    youtube_url: null,
    roles: [],
    worship_positions: ['Synthesizer'],
    step_positions: ['Planning Team'],
    description: '홍보팀 + 세컨건반'
  },
  {
    id: 11,
    name: '신예솔',
    affiliation: '고등부',
    photo_url: photoYesol,
    instagram_url: 'https://www.instagram.com/yz_sol5',
    youtube_url: 'https://youtube.com/channel/UCvyHxOBm7RDwCo62pFBwVSA',
    roles: [],
    worship_positions: ['Vocal'],
    step_positions: ['Media Team'],
    description: '홍보팀 + 싱어'
  },
  {
    id: 12,
    name: '신지은',
    affiliation: '청년부',
    photo_url: logo,
    instagram_url: 'https://www.instagram.com/_wldms.3',
    youtube_url: null,
    roles: [],
    worship_positions: ['Piano', 'Synthesizer'],
    step_positions: ['Planning Team'],
    description: '홍보팀 + 메인건반'
  },
  {
    id: 13,
    name: '오종언',
    affiliation: '청년부',
    photo_url: photoJongeon,
    instagram_url: 'https://www.instagram.com/5_bells_05',
    youtube_url: null,
    roles: [],
    worship_positions: ['Vocal'],
    step_positions: ['Live Engineer', 'Music Producer', 'Audio Setup'],
    description: '무대구상 + 프리프로덕션 보조 + 싱어 + 음향 설계'
  },
  {
    id: 14,
    name: '오현명',
    affiliation: '장년부',
    photo_url: logo,
    instagram_url: 'https://www.instagram.com/5rosy_n_5lira',
    youtube_url: null,
    roles: ['Stage Leader'],
    worship_positions: ['Piano'],
    step_positions: ['Audio Setup'],
    description: '메인건반 + 무대팀장'
  },
  {
    id: 15,
    name: '유근서',
    affiliation: '청년부',
    photo_url: logo,
    instagram_url: null,
    youtube_url: null,
    roles: [],
    worship_positions: ['Lead Guitar'],
    step_positions: ['Prayer Team'],
    description: '리드기타 + 기도팀'
  },
  {
    id: 16,
    name: '지용민',
    affiliation: '장년부',
    photo_url: logo,
    instagram_url: null,
    youtube_url: null,
    roles: ["Lead Singer"],
    worship_positions: ['Vocal'],
    step_positions: ['Accounting Team'],
    description: '인도자 + 회계'
  },
  {
    id: 17,
    name: '최영',
    affiliation: '장년부',
    photo_url: logo,
    instagram_url: 'https://www.instagram.com/breeze2174',
    youtube_url: null,
    roles: ['Prayer leader'],
    worship_positions: ['Vocal'],
    step_positions: ['Audio Setup'],
    description: '싱어(화음) + 기도팀장'
  }
])

const filteredMembers = computed(() => {
  let filtered = members.value

  if (filter.value === 'leader') {
    filtered = filtered.filter(m => m.roles.length > 0)
  } else if (filter.value === 'worship') {
    filtered = filtered.filter(m => m.worship_positions.length > 0)
  } else if (filter.value === 'step') {
    filtered = filtered.filter(m => m.step_positions.length > 0)
  }

  if (filter.value === 'worship' && worshipFilter.value) {
    if (worshipFilter.value === 'Piano') {
      filtered = filtered.filter(m =>
        m.worship_positions.some(p => ['Piano', 'Synthesizer'].includes(p))
      )
    } else if (worshipFilter.value === 'Guitar') {
      filtered = filtered.filter(m =>
        m.worship_positions.some(p =>
          ['Acoustic Guitar', 'Lead Guitar', 'Backing Guitar', 'Bass Guitar'].includes(p)
        )
      )
    } else {
      filtered = filtered.filter(m =>
        m.worship_positions.includes(worshipFilter.value)
      )
    }
  }

  if (filter.value === 'step' && stepFilter.value) {
    if (stepFilter.value === '홍보팀') {
      filtered = filtered.filter(m =>
        m.step_positions.includes('Planning Team') || 
        m.step_positions.includes('Instagram Manager') || 
        m.step_positions.includes('Poster Designer') || 
        m.step_positions.includes('Guidebook Designer') ||
        m.roles.includes('Planning Leader')
      )
    } else if (stepFilter.value === '영상팀') {
      filtered = filtered.filter(m =>
        m.step_positions.some(p =>
          ['Camera Operator', 'Video Editor', 'YouTube Manager', 'Mix Engineer', 'Master Engineer', 'Music Producer'].includes(p)
        )
      )
    } else if (stepFilter.value === '무대팀') {
      filtered = filtered.filter(m =>
        m.step_positions.some(p =>
          ['Stage Designer', 'Live Engineer', 'Lighting Operator', 'Audio Setup'].includes(p)
        )
      )
    }
  }

  if (filter.value === 'leader') {
    filtered.sort((a, b) => {
      const roleOrder: { [key: string]: number } = {
        'Pastor': 1,
        'Elder': 2,
        'Worship Team Leader': 3,
        'Accounting': 4,
        'Singer Leader': 5,
        'Lead Singer': 6,
        'Session Leader': 7,
        'Planning Leader': 8,
        'Media Leader': 9,
        'Stage Leader': 10,
        'Prayer leader': 11
      }

      const getMinOrder = (roles: string[]) => {
        const orders = roles.map(r => roleOrder[r] || 99)
        return Math.min(...orders)
      }

      const orderA = getMinOrder(a.roles)
      const orderB = getMinOrder(b.roles)

      if (orderA !== orderB) {
        return orderA - orderB
      }

      return a.name.localeCompare(b.name, 'ko-KR')
    })
  }

  if (filter.value === 'worship') {
    filtered.sort((a, b) => {
      const getPriority = (member: Member) => {
        if (member.roles.includes('Worship Team Leader')) return 1
        if (member.roles.includes('Singer Leader')) return 2
        if (member.roles.includes('Lead Singer')) return 3
        if (member.roles.includes('Session Leader')) return 4
        if (member.roles.includes('Elder')) return 5
        return 6
      }

      const priorityA = getPriority(a)
      const priorityB = getPriority(b)

      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      const positionOrder: { [key: string]: number } = {
        'Vocal': 1,
        'Piano': 2,
        'Synthesizer': 3,
        'Acoustic Guitar': 4,
        'Lead Guitar': 5,
        'Backing Guitar': 6,
        'Bass Guitar': 7,
        'Drum': 8
      }

      const getPositionOrder = (positions: string[]) => {
        if (positions.length === 0) return 99
        const orders = positions.map(p => positionOrder[p] || 99)
        return Math.min(...orders)
      }

      const posOrderA = getPositionOrder(a.worship_positions)
      const posOrderB = getPositionOrder(b.worship_positions)

      if (posOrderA !== posOrderB) {
        return posOrderA - posOrderB
      }

      return a.name.localeCompare(b.name, 'ko-KR')
    })
  }

  return filtered
})

const handleMainFilter = (value: 'all' | 'leader' | 'worship' | 'step') => {
  filter.value = value
  worshipFilter.value = ''
  stepFilter.value = ''
}
</script>