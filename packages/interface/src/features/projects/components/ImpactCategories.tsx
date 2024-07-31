import { Tag } from "~/components/ui/Tag";
import { impactCategories } from "~/config";

export interface IImpacCategoriesProps {
  tags?: string[];
}

export const ImpactCategories = ({ tags = undefined }: IImpacCategoriesProps): JSX.Element => (
  <div className="no-scrollbar">
    <div className="flex gap-1 overflow-x-auto">
      {tags?.map((key) => (
        <div key={key}>
          {Object.keys(impactCategories).includes(key) ? (
            <Tag size="sm">{impactCategories[key as keyof typeof impactCategories].label}</Tag>
          ) : null}
        </div>
      ))}
    </div>
  </div>
);
