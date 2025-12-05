<script setup lang="ts">
import type { CheckboxGroupItem, InputMenuItem } from "@nuxt/ui";

const inputMenuItems = ref<InputMenuItem[]>([
  {
    label: "Backlog",
    id: "backlog",
  },
  {
    label: "Todo",
    id: "todo",
  },
  {
    label: "In Progress",
    id: "in_progress",
  },
  {
    label: "Done",
    id: "done",
  },
]);

const checkboxGroupItems = ref<CheckboxGroupItem[]>([
  {
    label: "System",
    description: "This is the first option.",
    id: "system",
  },
  {
    label: "Light",
    description: "This is the second option.",
    id: "light",
  },
  {
    label: "Dark",
    description: "This is the third option.",
    id: "dark",
  },
]);

type State = {
  input: string;
  inputMenu: string;
  inputNumber: number;
  checkboxGroup: string[];
};

const state = reactive<State>({
  input: "",
  inputMenu: "todo",
  inputNumber: 0,
  checkboxGroup: [],
});
</script>

<template>
  <UContainer class="py-6">
    <h1 class="text-2xl font-bold">{{ $t("title") }}</h1>
    <UCard class="mt-4" variant="subtle">
      <UForm :state="state" class="space-y-4">
        <UFormField label="Input" name="input">
          <UInput
            class="w-full"
            v-model="state.input"
            type="text"
            @update:model-value="
              (value) => {
                console.log('input changed:', value);
                console.log('input state:', state.input);
              }
            "
          />
        </UFormField>
        <UFormField label="InputMenu" name="inputMenu">
          <UInputMenu
            class="w-full"
            v-model="state.inputMenu"
            value-key="id"
            :items="inputMenuItems"
            @update:model-value="
              (value) => {
                console.log('inputMenu changed:', value);
                console.log('inputMenu state:', state.inputMenu);
              }
            "
          />
        </UFormField>
        <UFormField label="InputNumber" name="inputNumber">
          <UInputNumber
            class="w-full"
            v-model="state.inputNumber"
            :increment="false"
            :decrement="false"
            @update:model-value="
              (value) => {
                console.log('inputNumber changed:', value);
                console.log('inputNumber state:', state.inputNumber);
              }
            "
          />
        </UFormField>
        <UFormField label="CheckboxGroup" name="checkboxGroup">
          <UCheckboxGroup
            color="primary"
            variant="card"
            v-model="state.checkboxGroup"
            value-key="id"
            :items="checkboxGroupItems"
            @update:model-value="
              (value) => {
                console.log('checkboxGroup changed:', value);
                console.log('checkboxGroup state:', state.checkboxGroup);
              }
            "
          />
        </UFormField>
      </UForm>
    </UCard>
    <UCard class="mt-4" variant="subtle">
      <p>Input: {{ state.input }}</p>
      <p>InputMenu: {{ state.inputMenu }}</p>
      <p>InputNumber: {{ state.inputNumber }}</p>
      <p>CheckboxGroup: {{ state.checkboxGroup }}</p>
    </UCard>
  </UContainer>
</template>
