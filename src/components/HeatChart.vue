<template>
  <div class="heat-chart">
    <div class="chart-header">
      <div class="chart-title-block">
        <h2>Extreme Hot Days Accounting Over Years</h2>
      </div>
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
    <div v-else-if="error" class="chart-error">{{ error }}</div>
    <div v-else class="chart-wrap">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const API_BASE = 'http://127.0.0.1:8000'

const rawData = ref([])
const loading = ref(true)
const error = ref('')
const yearFrom = ref(1910)
const yearTo = ref(2020)

const yearOptions = computed(() => {
  const years = rawData.value.map((d) => d.Year)
  if (years.length === 0) return []
  const min = Math.min(...years)
  const max = Math.max(...years)
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
})

const filteredData = computed(() => {
  const from = yearFrom.value
  const to = yearTo.value
  return rawData.value.filter((d) => d.Year >= from && d.Year <= to)
})

const chartData = computed(() => ({
  labels: filteredData.value.map((d) => d.Year),
  datasets: [
    {
      label: 'Number of extreme hot days',
      data: filteredData.value.map((d) => d.NumberofDays),
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.12)',
      tension: 0.2,
      fill: true,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: '#4b5563',
      },
    },
    title: { display: false },
  },
  scales: {
    x: {
      title: { display: true, text: 'Year', color: '#4b5563' },
      grid: { color: 'rgba(148, 163, 184, 0.18)' },
      ticks: { color: '#4b5563', maxTicksLimit: 15 },
    },
    y: {
      title: { display: true, text: 'Number of extreme hot days', color: '#4b5563' },
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.18)' },
      ticks: { color: '#4b5563' },
    },
  },
}

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_BASE}/db/one_percent_heat`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    rawData.value = json.data || []
    if (rawData.value.length > 0) {
      const years = rawData.value.map((d) => d.Year)
      yearFrom.value = Math.min(...years)
      yearTo.value = Math.max(...years)
    }
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

onMounted(fetchData)
</script>

<style scoped>
.heat-chart {
  margin-top: 24px;
  width: 1200px;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: 24px 28px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 251, 247, 0.96), rgba(255, 247, 237, 0.94));
  border: 1px solid rgba(249, 115, 22, 0.12);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
  color: #1f2937;
}

.chart-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-title-block {
  flex: 1 1 100%;
  display: flex;
  justify-content: center;
  text-align: center;
}

.chart-header h2 {
  margin: 0;
  font-size: 1.7rem;
  line-height: 1.1;
  color: #7c2d12;
}

.year-range {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.year-range label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #4b5563;
}

.year-range select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(255, 255, 255, 0.88);
  color: #1f2937;
  font-size: 0.9rem;
}

.year-range select:focus {
  outline: 2px solid rgba(249, 115, 22, 0.28);
  outline-offset: 1px;
}

.chart-wrap {
  height: 480px;
  width: 100%;
}

.chart-loading,
.chart-error {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.chart-error {
  color: #f87171;
}
</style>
