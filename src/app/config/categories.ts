export type CategoryType = "fashion" | "regular";

export interface CategoryConfig {
  id: string;
  label: string;
  kvv: number;
  buyoutRate: number;
  type: CategoryType;
}

export const categories: CategoryConfig[] = [
  {
    id: "clothes",
    label: "Одежда",
    kvv: 0.25,
    buyoutRate: 0.4,
    type: "fashion",
  },
  { id: "shoes", label: "Обувь", kvv: 0.22, buyoutRate: 0.4, type: "fashion" },
  {
    id: "home",
    label: "Товары для дома",
    kvv: 0.18,
    buyoutRate: 0.9,
    type: "regular",
  },
  {
    id: "beauty",
    label: "Красота и уход",
    kvv: 0.17,
    buyoutRate: 0.9,
    type: "regular",
  },
  {
    id: "electronics",
    label: "Электроника и аксессуары",
    kvv: 0.12,
    buyoutRate: 0.9,
    type: "regular",
  },
  {
    id: "kids",
    label: "Детские товары",
    kvv: 0.17,
    buyoutRate: 0.9,
    type: "regular",
  },
  {
    id: "sport",
    label: "Спорт и отдых",
    kvv: 0.17,
    buyoutRate: 0.9,
    type: "regular",
  },
  { id: "other", label: "Другое", kvv: 0.18, buyoutRate: 0.9, type: "regular" },
];
