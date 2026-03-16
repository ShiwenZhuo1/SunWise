<template>
  <div class="skin-chart">
    <div class="chart-header">
      <h2>Skin Cancer Incidence Trends (All Ages Combined)</h2>
      <div class="year-range">
        <label>
          <span>From</span>
          <select v-model.number="yearFrom">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </label>
        <label>
          <span>To</span>
          <select v-model.number="yearTo">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </label>
      </div>
    </div>
    <div v-if="loading" class="chart-loading">Loading...</div>
    <div v-else-if="error" class="chart-error">
      <span>{{ error }}</span>
      <p class="chart-error-hint">If deployed: set VITE_API_BASE in Vercel and allow CORS from your frontend origin.</p>
    </div>
    <div v-else class="chart-wrap">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { API_BASE } from '../config'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const chartAreaBackgroundPlugin = {
  id: 'chartAreaBackground',
  beforeDraw(chart) {
    const ctx = chart.ctx
    const area = chart.chartArea
    if (!area) return
    ctx.save()
    ctx.fillStyle = 'rgba(248, 250, 252, 0.98)'
    ctx.fillRect(area.left, area.top, area.right - area.left, area.bottom - area.top)
    ctx.restore()
  },
}
ChartJS.register(chartAreaBackgroundPlugin)

const rawData = ref([])
const loading = ref(true)
const error = ref('')
const yearFrom = ref(1982)
const yearTo = ref(2020)

const yearOptions = computed(() => {
  const allAges = rawData.value.filter((row) => {
    const ag = getAgeGroup(row)
    return ag && String(ag).toLowerCase().includes('all ages')
  })
  const years = [...new Set(allAges.map((r) => r.Year))].filter(Boolean).sort((a, b) => a - b)
  if (years.length === 0) return []
  const min = Math.min(...years)
  const max = Math.max(...years)
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
})

// API may use "Age group (years)" and "Age-specific rate\n(per 100,000)" or similar
function getRate(row) {
  const key = Object.keys(row).find((k) => k.includes('Age-specific rate') || k.includes('rate'))
  return key != null ? Number(row[key]) : null
}

function getAgeGroup(row) {
  const key = Object.keys(row).find((k) => k.toLowerCase().includes('age group'))
  return key != null ? row[key] : null
}

const chartData = computed(() => {
  const allAges = rawData.value.filter((row) => {
    const ag = getAgeGroup(row)
    return ag && String(ag).toLowerCase().includes('all ages')
  })

  const from = yearFrom.value
  const to = yearTo.value
  const years = [...new Set(allAges.map((r) => r.Year))]
    .filter((y) => y >= from && y <= to)
    .sort((a, b) => a - b)

  const bySex = { Males: [], Females: [], Persons: [] }
  years.forEach((y) => {
    ;['Males', 'Females', 'Persons'].forEach((sex) => {
      const row = allAges.find((r) => r.Year === y && r.Sex === sex)
      bySex[sex].push(row ? getRate(row) : null)
    })
  })

  return {
    labels: years,
    datasets: [
      {
        label: 'Males',
        data: bySex.Males,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        pointStyle: 'circle',
        pointRadius: 4,
        tension: 0.2,
      },
      {
        label: 'Females',
        data: bySex.Females,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointStyle: 'rect',
        pointRadius: 4,
        tension: 0.2,
      },
      {
        label: 'Persons',
        data: bySex.Persons,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        pointStyle: 'triangle',
        pointRadius: 4,
        tension: 0.2,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#475569',
        usePointStyle: true,
        padding: 16,
      },
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'Year', color: '#475569' },
      grid: { color: 'rgba(148, 163, 184, 0.2)' },
      ticks: { color: '#475569', maxTicksLimit: 14 },
    },
    y: {
      title: {
        display: true,
        text: 'Age-specific rate (per 100,000)',
        color: '#475569',
      },
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.2)' },
      ticks: { color: '#475569' },
    },
  },
}

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_BASE}/db/skin_cancer`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    rawData.value = Array.isArray(json) ? json : json.data || json.records || []
  } catch (e) {
    error.value = e.message || 'Failed to load data'
    rawData.value = []
  } finally {
    loading.value = false
  }
}

watch([yearFrom, yearTo], ([from, to]) => {
  if (from > to) {
    if (yearFrom.value === from) yearTo.value = from
    else yearFrom.value = to
  }
})

onMounted(() => {
  fetchData().then(() => {
    if (rawData.value.length > 0 && yearOptions.value.length > 0) {
      yearFrom.value = yearOptions.value[0]
      yearTo.value = yearOptions.value[yearOptions.value.length - 1]
    }
  })
})
</script>

<style scoped>
.skin-chart {
  margin-top: 24px;
  width: 1200px;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: 24px 28px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 251, 247, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
  color: #111827;
}

.chart-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #7c2d12;
  text-align: center;
  grid-column: 2;
}

.year-range {
  display: flex;
  align-items: center;
  gap: 12px;
  grid-column: 3;
  justify-self: end;
}

.year-range label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #475569;
}

.year-range select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: #fff;
  color: #111827;
  font-size: 0.9rem;
}

.chart-wrap {
  height: 480px;
  width: 100%;
  background: #f8fafc;
  border-radius: 12px;
}

.chart-loading,
.chart-error {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.95rem;
}

.chart-error {
  color: #dc2626;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}

.chart-error-hint {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
  max-width: 280px;
}

@media (max-width: 768px) {
  .chart-header {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .chart-header h2,
  .year-range {
    grid-column: auto;
  }

  .year-range {
    justify-self: center;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
