<script setup lang="ts">
const { report } = useFengShui()
const { state, reset } = useWizard()
const { shareReport } = useReport()
const { t } = useI18n()

const toast = useToast()

async function handleShare() {
  const success = await shareReport(state.value)
  toast.add({
    title: success ? t('report.linkCopied') : 'Failed to copy link',
    color: success ? 'success' : 'error',
    duration: 2000,
  })
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-6">{{ $t('report.title') }}</h2>

    <ReportOverall :report="report" />
    <ReportBreakdown :report="report" />
    <ReportIssues :report="report" />

    <div class="flex gap-3 mt-6">
      <UButton color="primary" icon="i-lucide-share-2" @click="handleShare">
        {{ $t('report.shareReport') }}
      </UButton>
      <UButton color="neutral" variant="outline" icon="i-lucide-rotate-ccw" @click="reset">
        {{ $t('report.startOver') }}
      </UButton>
    </div>
  </div>
</template>
