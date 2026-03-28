import { fengShuiItems, calculateScore, optionsMap } from "~/data/fengShui";
import type { FengShuiRating } from "~/types/fengshui";

type FengShuiItemId = string;
type FengShuiOptionId = string;

export interface FengShuiState {
  selectedOptions: Map<FengShuiItemId, FengShuiOptionId[]>;
}

export function useFengShui() {
  const { t } = useI18n();

  const state = useState<FengShuiState>("fengshui-state", () => ({
    selectedOptions: new Map<FengShuiItemId, FengShuiOptionId[]>(
      fengShuiItems.map((item) => [item.id, []])
    ),
  }));

  const score = computed(() =>
    calculateScore(
      Array.from(state.value.selectedOptions.values()).flatMap((optionIds) =>
        optionIds.map((id) => optionsMap.get(id)!)
      )
    )
  );

  const rating = computed<FengShuiRating>(() => {
    const ratings: Array<{ threshold: number } & FengShuiRating> = [
      { threshold: 90, label: t("excellentFengShui"), color: "emerald" },
      { threshold: 70, label: t("goodFengShui"), color: "emerald" },
      { threshold: 50, label: t("fairFengShui"), color: "yellow" },
      { threshold: 30, label: t("poorFengShui"), color: "orange" },
    ];

    return (
      ratings.find((rating) => score.value >= rating.threshold) || {
        label: t("badFengShui"),
        color: "red",
      }
    );
  });

  return {
    state,
    score,
    rating,
  };
}
