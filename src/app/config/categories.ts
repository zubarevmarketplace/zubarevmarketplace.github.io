export type CategoryType = "fashion" | "regular";

export interface CategoryConfig {
  id: string;
  label: string;

  /**
   * Legacy-поле для старой логики.
   * Храним как долю: 0.345 = 34.5%.
   * В новых формулах лучше использовать fboCommissionRate / fbsCommissionRate.
   */
  kvv: number;

  /**
   * Комиссия WB для FBO / склад WB.
   * Храним как процент: 34.5 = 34.5%.
   */
  fboCommissionRate: number;

  /**
   * Комиссия WB для FBS / склад продавца.
   * Храним как процент: 38 = 38%.
   */
  fbsCommissionRate: number;

  /**
   * Средняя доля выкупа.
   * Храним как долю: 0.4 = 40%.
   */
  buyoutRate: number;

  type: CategoryType;
}

export const categories: CategoryConfig[] = [
  {
    id: "clothes",
    label: "Одежда",
    kvv: 0.345,
    fboCommissionRate: 34.5,
    fbsCommissionRate: 38,
    buyoutRate: 0.4,
    type: "fashion",
  },
  {
    id: "shoes",
    label: "Обувь",
    kvv: 0.345,
    fboCommissionRate: 34.5,
    fbsCommissionRate: 38,
    buyoutRate: 0.4,
    type: "fashion",
  },
  {
    id: "home",
    label: "Товары для дома",
    kvv: 0.285,
    fboCommissionRate: 28.5,
    fbsCommissionRate: 32,
    buyoutRate: 0.9,
    type: "regular",
  },
  {
    id: "beauty",
    label: "Красота и уход",
    kvv: 0.325,
    fboCommissionRate: 32.5,
    fbsCommissionRate: 36,
    buyoutRate: 0.9,
    type: "regular",
  },
  {
    id: "electronics",
    label: "Электроника и аксессуары",
    kvv: 0.275,
    fboCommissionRate: 27.5,
    fbsCommissionRate: 31,
    buyoutRate: 0.9,
    type: "regular",
  },
  {
    id: "kids",
    label: "Детские товары",
    kvv: 0.28,
    fboCommissionRate: 28,
    fbsCommissionRate: 31.5,
    buyoutRate: 0.9,
    type: "regular",
  },
  {
    id: "sport",
    label: "Спорт и отдых",
    kvv: 0.275,
    fboCommissionRate: 27.5,
    fbsCommissionRate: 31,
    buyoutRate: 0.9,
    type: "regular",
  },
  {
    id: "other",
    label: "Другое",
    kvv: 0.275,
    fboCommissionRate: 27.5,
    fbsCommissionRate: 31,
    buyoutRate: 0.9,
    type: "regular",
  },
];
