import { ObjectEntity } from "@site/models";

export type Entity = ObjectEntity & {
  key: string;
  leaf: boolean;
  loading: boolean;
  label: string;
  children?: Entity[];
};