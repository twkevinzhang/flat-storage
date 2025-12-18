<script setup lang="ts">
import { Form, FormInstance, FormSubmitEvent } from '@primevue/forms';
import { ObjectsFilter, SessionEntity, Driver } from '@site/models';
import { ObjectService } from '@site/services/object';
import { useListViewStore } from '@site/stores/list-view';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

const HmacDriver = [
  Driver.gcs,
  // Driver.s3, // 未開放
];

const RemoteDriver = [
  Driver.gcs,
  // Driver.s3, // 未開放
];

const { visible } = defineProps<{
  visible: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const formRef = ref<FormInstance | null>(null);
const router = useRouter();
const route = useRoute();
const store = useListViewStore();
const { filter } = storeToRefs(store);

const isLoading = ref(false);
const buckets = ref<string[]>([]);

async function handleStep1Next(activateCallback: (step: string) => void) {
  if (!formRef.value) return;

  if (RemoteDriver.includes(formRef.value)) {
    isLoading.value = true;
    try {
      const api = new ObjectService();
      api.listBuckets().then((r) => {
        buckets.value = r;
        activateCallback('2');
      });
    } catch (error) {
      console.error('Failed to fetch buckets:', error);
    } finally {
      isLoading.value = false;
    }
  }
}

function submit({ valid, values }: FormSubmitEvent) {
  if (valid) {
    emits('update:visible', false);
    const newObj = ObjectsFilter.empty();
    merge(newObj, filter?.value, values);
    navigate(newObj);
  }
}

function navigate(filter: ObjectsFilter) {
  router.push({
    path: route.path,
    query: filter.toQuery(),
  });
}
</script>

<template>
  <Form ref="formRef" v-slot="$form" @submit="submit">
    <Dialog
      :visible="visible"
      @update:visible="(val: boolean) => {
        if (!isLoading) emits('update:visible', val)
      }"
      header="New Session"
      modal
      pt:root:class="w-md h-3/4"
    >
      <Stepper value="1" class="basis-[50rem]">
        <StepList>
          <Step :disabled="isLoading" value="1">Header I</Step>
          <Step :disabled="isLoading" value="2">Header II</Step>
          <Step :disabled="isLoading" value="3">Header III</Step>
        </StepList>
        <StepPanels>
          <StepPanel v-slot="{ activateCallback }" value="1">
            <div class="flex flex-col gap-4">
              <Select
                name="session"
                :options="[
                  { label: 'Google Cloud Storage', value: 'gcs' },
                  { label: 'AWS S3', value: 's3' },
                  {
                    label: 'Local ObjectEntityystem',
                    value: 'localObjectEntityystem',
                  },
                ]"
                optionLabel="label"
                optionValue="value"
                placeholder="Session..."
                :disabled="isLoading"
                fluid
              />

              <Image
                v-if="$form.session?.value === Driver.gcs"
                src="images/brand-cloud-storage.png"
                alt="Image"
              />

              <Image
                v-if="$form.session?.value === Driver.s3"
                src="images/brand-aws-s3.png"
                alt="Image"
              />

              <FloatLabel variant="on">
                <InputText
                  :disabled="
                    !HmacDriver.includes($form.session?.value) || isLoading
                  "
                  name="accessKey"
                  type="text"
                  fluid
                  id="on_label"
                />
                <label for="on_label">Access Key</label>
              </FloatLabel>

              <FloatLabel variant="on">
                <InputText
                  :disabled="
                    !HmacDriver.includes($form.session?.value) || isLoading
                  "
                  name="text"
                  type="text"
                  fluid
                  id="on_label"
                />
                <label for="on_label">Secret Key</label>
              </FloatLabel>

              <div class="flex pt-2 justify-end">
                <Button
                  :loading="isLoading"
                  label="Next"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  @click="handleStep1Next(activateCallback)"
                />
              </div>
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="flex flex-col gap-4">
              <Listbox
                name="bucket"
                :options="buckets"
                placeholder="Select a Bucket"
                :disabled="isLoading"
                fluid
              />
            </div>
            <div class="flex pt-6 justify-between">
              <Button
                label="Back"
                severity="secondary"
                icon="pi pi-arrow-left"
                @click="activateCallback('1')"
              />
              <Button
                label="Next"
                icon="pi pi-arrow-right"
                iconPos="right"
                @click="() => $form.bucket?.value && activateCallback('3')"
              />
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="3">
            <div class="flex flex-col h-48">
              <div
                class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium"
              >
                Content III
              </div>
            </div>
            <div class="pt-6">
              <Button
                label="Back"
                severity="secondary"
                icon="pi pi-arrow-left"
                @click="activateCallback('2')"
              />
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
    </Dialog>
  </Form>
</template>
