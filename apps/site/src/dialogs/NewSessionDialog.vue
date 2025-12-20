<script setup lang="ts">
import { Form, FormInstance, FormSubmitEvent } from '@primevue/forms';
import { ObjectsFilter, SessionEntity, Driver, BucketEntity } from '@site/models';
import { INJECT_KEYS } from '@site/services';
import { ObjectService } from '@site/services/object';
import { SessionService } from '@site/services/session';
import { useListViewStore } from '@site/stores/list-view';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

const sessionApi = inject<SessionService>(INJECT_KEYS.SessionService)!;

// 支援 accessKey 的服務稱為 HmacDriver
const HmacDriver = [
  Driver.gcs,
  Driver.s3,
];

const RemoteDriver = [
  Driver.gcs,
  Driver.s3,
];

const { visible } = defineProps<{
  visible: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const initialValues = reactive({
  session: Driver.gcs,
  projectId: '',
  accessKey: '',
  secretKey: '',
  bucket: '',
  name: '',
  description: '',
});

const router = useRouter();
const route = useRoute();

const isLoading = ref(false);
const buckets = ref<BucketEntity[]>([]);

async function handleStep1Next(activateCallback: (step: string) => void) {
  if (!formRef.value) return;

  if (RemoteDriver.includes(formRef.value.session)) {
    isLoading.value = true;
    try {
      sessionApi.listBuckets({ accessKey: formRef.value.accessKey, secretKey: formRef.value.secretKey }).then((r) => {
        buckets.value = r;
        activateCallback('2');
      });
      buckets.value = result;
      activateCallback('2');
    } catch (error) {
      console.error('Failed to fetch buckets:', error);
    } finally {
      isLoading.value = false;
    }
  }
}

function handleFinish() {
  const session = SessionEntity.new({
    name: initialValues.name,
    description: initialValues.description,
    driver: initialValues.session,
    mount: initialValues.bucket,
    accessKey: initialValues.accessKey,
    secretKey: initialValues.secretKey,
    projectId: initialValues.projectId,
  });

  sessionStore.add(session);
  emits('update:visible', false);
  
  router.push({
    path: `/sessions/${session.id}/mount/${session.mount}`,
  });
}
</script>

<template>
    <Dialog
      :visible="visible"
      @update:visible="(val: boolean) => {
        if (!isLoading) emits('update:visible', val)
      }"
      header="New Session"
      modal
      pt:root:class="w-md"
    >
      <Form :initialValues="initialValues">
        <Stepper value="1">
          <StepList>
            <Step :disabled="isLoading" value="1">Credentials</Step>
            <Step :disabled="isLoading" value="2">Bucket</Step>
            <Step :disabled="isLoading" value="3">Details</Step>
          </StepList>
          <StepPanels>
            <StepPanel v-slot="{ activateCallback }" value="1">
              <div class="flex flex-col gap-4">
                <Select
                  v-model="initialValues.session"
                  name="session"
                  :options="[
                    { label: 'Google Cloud Storage', value: 'gcs' },
                    { label: 'AWS S3', value: 's3' },
                  ]"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Driver..."
                  :disabled="isLoading"
                  fluid
                />

                <div class="flex flex-col gap-4" v-if="initialValues.session">
                  <FloatLabel variant="on">
                    <InputText v-model="initialValues.projectId" name="projectId" fluid id="projectId" />
                    <label for="projectId">Project ID (Optional)</label>
                  </FloatLabel>

                  <FloatLabel variant="on">
                    <InputText v-model="initialValues.accessKey" name="accessKey" fluid id="accessKey" />
                    <label for="accessKey">Access Key</label>
                  </FloatLabel>

                  <FloatLabel variant="on">
                    <InputText v-model="initialValues.secretKey" name="secretKey" type="password" fluid id="secretKey" />
                    <label for="secretKey">Secret Key</label>
                  </FloatLabel>
                </div>

                <div class="flex pt-2 justify-end">
                  <Button
                    :loading="isLoading"
                    :disabled="!initialValues.session"
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
                  v-model="initialValues.bucket"
                  name="bucket"
                  :options="buckets"
                  optionLabel="name"
                  optionValue="name"
                  class="w-full"
                  :disabled="isLoading"
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
                  :disabled="!initialValues.bucket"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  @click="activateCallback('3')"
                />
              </div>
            </StepPanel>
            <StepPanel v-slot="{ activateCallback }" value="3">
              <div class="flex flex-col gap-4">
                <FloatLabel variant="on">
                  <InputText v-model="initialValues.name" name="name" fluid id="sessionName" />
                  <label for="sessionName">Session Name</label>
                </FloatLabel>
                <FloatLabel variant="on">
                  <Textarea v-model="initialValues.description" name="description" fluid id="sessionDesc" rows="3" />
                  <label for="sessionDesc">Description (Optional)</label>
                </FloatLabel>
              </div>
              <div class="flex pt-6 justify-between">
                <Button
                  label="Back"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  @click="activateCallback('2')"
                />
                <Button
                  label="Create Session"
                  severity="success"
                  icon="pi pi-check"
                  @click="handleFinish"
                />
              </div>
            </StepPanel>
          </StepPanels>
        </Stepper>
      </Form>
    </Dialog>
</template>


