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
            “너희는 너희 하나님 여호와를 순종하며, 그를 경외하며 그 명령을 지키며<br />
            그 목소리를 청종하며, 그를 섬기며 그에게 부종하고”
          </p>
          <cite>- 요한복음 14:27 -</cite>
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
          주님의 사랑을 잊고 살아가는 사람들에게 “너희는 잊어도 그리스도이신 주님께서는 아직도 우릴 찾고 있다”는 것을 다시금 깨닫게 하기 위해
        </div>
      </div>

      <div class="team-member-section">
        <h2>팀원 소개</h2>

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
            class="filter-btn"
            :class="{ active: worshipFilter === '' }"
            @click="worshipFilter = ''"
          >
            Worship All
          </button>
          <button
            class="filter-btn"
            :class="{ active: worshipFilter === 'Vocal' }"
            @click="worshipFilter = 'Vocal'"
          >
            Vocal
          </button>
          <button
            class="filter-btn"
            :class="{
              active:
                worshipFilter === 'Piano' || worshipFilter === 'Synthesizer'
            }"
            @click="worshipFilter = 'Piano'"
          >
            Piano
          </button>
          <button
            class="filter-btn"
            :class="{
              active:
                worshipFilter === 'Acoustic Guitar' ||
                worshipFilter === 'Electric Guitar' ||
                worshipFilter === 'Bass Guitar' ||
                worshipFilter === 'Guitar'
            }"
            @click="worshipFilter = 'Guitar'"
          >
            Guitar
          </button>
          <button
            class="filter-btn"
            :class="{ active: worshipFilter === 'Drum' }"
            @click="worshipFilter = 'Drum'"
          >
            Drum
          </button>
          <button
            class="filter-btn"
            :class="{ active: worshipFilter === 'Engineer' }"
            @click="worshipFilter = 'Engineer'"
          >
            Engineer
          </button>
        </div>

        <div v-if="filter === 'step'" class="step-filters">
          <button
            class="filter-btn"
            :class="{ active: stepFilter === '' }"
            @click="stepFilter = ''"
          >
            Step All
          </button>
          <button
            class="filter-btn"
            :class="{ active: stepFilter === 'Media' }"
            @click="stepFilter = 'Media'"
          >
            Media
          </button>
          <button
            class="filter-btn"
            :class="{ active: stepFilter === 'Planning Team' }"
            @click="stepFilter = 'Planning Team'"
          >
            Planning Team
          </button>
        </div>

        <div class="member-grid">
          <div
            v-for="(member, index) in filteredMembers"
            :key="index"
            class="member-card"
          >
            <img
              :src="member.photo"
              :alt="member.name"
              class="member-photo"
            />
            <div class="member-info">
              <h3>{{ member.name }}</h3>
              <p class="acount">{{ member.acount.join(', ') }}</p>
              <p class="affiliation">{{ member.affiliation }}</p>
              <p class="position">{{ member.positions.join(', ') }}</p>
              <div class="social-links">
                <a
                  v-if="member.instagram"
                  :href="member.instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="icon-link"
                >
                  <span class="icon-text">IG</span>
                </a>
                <a
                  v-if="member.youtube"
                  :href="member.youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="icon-link"
                >
                  <span class="icon-text">YT</span>
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
import logo from  '@/assets/image/LOGO.JPG'
import photoGiin from '@/assets/people/Giin.jpeg'
import photoMijung from '@/assets/people/mijung.jpeg'
import photoInho from '@/assets/people/inho.JPG'
import photoDrumWook from '@/assets/people/DrumWook.jpeg'
import photoJungsuk from '@/assets/people/jungsuk.jpeg'
import photoOnnew from '@/assets/people/onnew.jpeg'
import photoJongeon from '@/assets/people/Jongeon.jpeg'
import photoYesol from '@/assets/people/yesol.jpeg'

type Member = {
  name: string
  affiliation: string
  acount: string[]
  positions: string[]
  instagram?: string
  youtube?: string
  photo?: string
}

const filter = ref<'all' | 'leader' | 'worship' | 'step'>('all')
const worshipFilter = ref<string>('')
const stepFilter = ref<string>('')

const members = ref<Member[]>([
  {
    name: '박훈 목사',
    affiliation: '목사',
    acount: ['Pastor'],
    positions: ['Pastor'],
    instagram: 'https://www.instagram.com/holyforest.jpg',
    photo: logo,
  },
  {
    name: '이기인 장로',
    affiliation: '장년부',
    acount: ['Elder'],
    positions: ['Elder'],
    instagram: '',
    youtube: '',
    photo: photoGiin,
  },
  {
    name: '김미정 집사',
    affiliation: '장년부',
    acount: ['Accounting'],
    positions: ['Accounting'],
    instagram: 'https://www.instagram.com/cat0925_',
    photo: photoMijung,
  },
  {
    name: '엄인호',
    affiliation: '청년부',
    acount: ['Worship Team Leader'],
    positions: ['Vocal', 'Acoustic Guitar', 'Electric Guitar', 'Engineer'],
    instagram: 'https://www.instagram.com/djsy_01',
    youtube: 'https://www.youtube.com/@djsy-r2c',
    photo: photoInho,
  },
  {
    name: '박상욱',
    affiliation: '청년부',
    acount: ['Worship Team Sub Leader'],
    positions: ['Bass Guitar', 'Drum', 'Engineer'],
    instagram: 'https://www.instagram.com/drum_wook02',
    youtube:
      'https://youtube.com/channel/UC_vv_fm_8e3O8xTb5TbPKrg?si=5B5EEspQ7m8hhgYE',
    photo: photoDrumWook,
  },
  {
    name: '전예원',
    affiliation: '청년부',
    acount: ['Planning team leader', 'Worship'],
    positions: ['Vocal'],
    instagram: 'https://www.instagram.com/winnie_the_ron_02',
    photo: logo,
  },
  {
    name: '지용민 집사',
    affiliation: '장년부',
    acount: ['Worwhip'],
    positions: ['Vocal'],
    photo: logo,
  },
  {
    name: '최영 집사',
    affiliation: '장년부',
    acount: ['Worship'],
    positions: ['Vocal'],
    photo: logo,
  },
  {
    name: '박소라 집사',
    affiliation: '장년부',
    acount: ['Worship'],
    positions: ['Synthesizer'],
    photo: logo,
  },
  {
    name: '오현명 집사',
    affiliation: '장년부',
    acount: ['Worship'],
    positions: ['Piano'],
    instagram: 'https://www.instagram.com/5hyunmy/',
    photo: logo,
  },
  {
    name: '유근서',
    affiliation: '청년부',
    acount: ['Worship'],
    positions: ['Acoustic Guitar', 'Electric Guitar'],
    photo: logo,
  },
  {
    name: '김정석',
    affiliation: '청년부',
    acount: ['Worship'],
    positions: ['Bass Guitar'],
    instagram: 'https://www.instagram.com/_kjs_1127',
    photo: photoJungsuk,
  },
  {
    name: '김온유',
    affiliation: '청년부',
    acount: ['Worship', 'Planning Team'],
    positions: ['Vocal'],
    instagram: 'https://www.instagram.com/onyourmusic',
    youtube: 'https://www.youtube.com/@onyourmusic',
    photo: photoOnnew,
  },
  {
    name: '오종언',
    affiliation: '청년부',
    acount: ['Worship'],
    positions: ['Vocal', 'Engineer'],
    instagram: 'https://www.instagram.com/5_bells_05',
    photo: photoJongeon,
  },
  {
    name: '신지은',
    affiliation: '청년부',
    acount: ['Worship', 'Planning Team'],
    positions: ['Piano', 'Synthesizer'],
    instagram: 'https://www.instagram.com/_wldms.3',
    photo: logo,
  },
  {
    name: '마승빈',
    affiliation: '고등부',
    acount: ['Worship'],
    positions: ['Drum'],
    instagram: 'https://www.instagram.com/z.sbbxn_',
    photo: logo,
  },
  {
    name: '신예솔',
    affiliation: '고등부',
    acount: ['Worship', 'Planning Team'],
    positions: ['Vocal'],
    instagram: 'https://www.instagram.com/yz_sol5',
    youtube:
      'https://youtube.com/channel/UCvyHxOBm7RDwCo62pFBwVSA?si=eBgRDrWO0dP5sE9H',
    photo: photoYesol,
  },
])

const filteredMembers = computed(() => {
  return members.value.filter((member) => {
    if (filter.value === 'all') return true

    if (filter.value === 'leader') {
      return [
        'Pastor',
        'Elder',
        'Accounting',
        'Secretary',
        'Worship Team Leader',
        'Worship Team Sub Leader',
        'Planning team leader',
      ].some((role) => member.acount.includes(role))
    }

    if (filter.value === 'worship') {
      const isWorshipLeader = member.acount.includes('Worship Team Leader')
      const isWorshipSubLeader = member.acount.includes(
        'Worship Team Sub Leader',
      )
      const hasWorshipPosition = member.positions.some((pos) =>
        [
          'Vocal',
          'Piano',
          'Synthesizer',
          'Acoustic Guitar',
          'Electric Guitar',
          'Bass Guitar',
          'Drum',
          'Engineer',
        ].includes(pos),
      )

      if (worshipFilter.value === '') {
        return isWorshipLeader || isWorshipSubLeader || hasWorshipPosition
      } else if (worshipFilter.value === 'Guitar') {
        return member.positions.some((pos) =>
          ['Acoustic Guitar', 'Electric Guitar', 'Bass Guitar'].includes(pos),
        )
      } else if (worshipFilter.value === 'Piano') {
        return (
          member.positions.includes('Piano') ||
          member.positions.includes('Synthesizer')
        )
      } else {
        return member.positions.includes(worshipFilter.value)
      }
    }

    if (filter.value === 'step') {
      const isPlanningTeam =
        member.acount.includes('Planning Team') ||
        member.acount.includes('Planning team leader')
      const hasStepPosition = member.positions.some((pos) =>
        ['Media', 'Planning Team'].includes(pos),
      )

      if (!isPlanningTeam && !hasStepPosition) return false

      if (stepFilter.value === '') {
        return true
      } else {
        if (stepFilter.value === 'Planning Team') {
          return (
            member.positions.includes('Planning Team') ||
            member.acount.includes('Planning Team') ||
            member.acount.includes('Planning team leader')
          )
        }
        return member.positions.includes(stepFilter.value)
      }
    }

    return false
  })
})

const handleMainFilter = (value: 'all' | 'leader' | 'worship' | 'step') => {
  filter.value = value
  worshipFilter.value = ''
  stepFilter.value = ''
}
</script>