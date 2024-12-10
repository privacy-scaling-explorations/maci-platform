import clsx from "clsx";
import { useMemo, type ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import Markdown from "react-markdown";
import { Hex } from "viem";
import { useAccount } from "wagmi";

import { Heading } from "~/components/ui/Heading";
import { Tag } from "~/components/ui/Tag";
import { impactCategories } from "~/config";
import { ProjectItem } from "~/features/projects/components/ProjectItem";

import type { Application } from "../types";

import { LinkField } from "./LinkField";

interface IValueFieldProps {
  title: string;
  body?: ReactNode;
  required?: boolean;
}

const ValueField = ({ title, body = undefined, required = false }: IValueFieldProps): JSX.Element => {
  const emptyPlaceholder = "(empty)";

  return (
    <div className="flex flex-col gap-2 text-xs sm:text-sm">
      <b className={clsx(required && "after:text-blue-400 after:content-['*']")}>{title}</b>

      <div className="text-light flex flex-wrap gap-2 break-all text-gray-400">
        {body === undefined && emptyPlaceholder}

        {Array.isArray(body) && body.length === 0 && emptyPlaceholder}

        {typeof body === "string" && body.length === 0 && emptyPlaceholder}

        {((typeof body === "string" && body.length > 0) || typeof body !== "string") && body}
      </div>
    </div>
  );
};

const MarkdownField = ({ title, body = undefined, required = false }: IValueFieldProps): JSX.Element => {
  const emptyPlaceholder = "(empty)";

  return (
    <div className="flex flex-col gap-2 ">
      <b className={clsx(required && "text-xs after:text-blue-400 after:content-['*'] sm:text-sm")}>{title}</b>

      <div className="text-light flex flex-col flex-wrap gap-2 text-gray-400">
        {body === undefined && emptyPlaceholder}

        {Array.isArray(body) && body.length === 0 && emptyPlaceholder}

        {typeof body === "string" && body.length === 0 && emptyPlaceholder}

        {((typeof body === "string" && body.length > 0) || typeof body !== "string") && body}
      </div>
    </div>
  );
};

export const ReviewApplicationDetails = (): JSX.Element => {
  const form = useFormContext<Application>();

  const application = useMemo(() => form.getValues(), [form]);

  const { address } = useAccount();

  return (
    <div className="markdown-support flex flex-col gap-8">
      <div>
        <Heading className="mb-1 font-sans text-xl font-semibold">Review & Submit</Heading>

        <p className="leading-loose text-gray-400">Please review and submit your project application.</p>
      </div>

      <div className="flex flex-col gap-6 dark:text-white">
        <b className="text-lg">Project Profile</b>

        <ValueField required body={application.name} title="Project name" />

        <ValueField required body={address} title="Created By" />

        <MarkdownField required body={<Markdown>{application.bio}</Markdown>} title="Project description" />

        <div className="grid grid-flow-row gap-4 sm:grid-cols-2">
          <ValueField required body={application.websiteUrl} title="Website" />

          <ValueField required body={application.payoutAddress} title="Payout address" />

          <ValueField body={application.twitter} title="X(Twitter)" />

          <ValueField body={application.github} title="Github" />
        </div>

        <div className="gap-6 sm:flex">
          <div>
            <p>Project avatar</p>

            <div
              className="h-48 w-48 rounded-full bg-gray-200 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("${application.profileImageUrl}")`,
              }}
            />
          </div>

          <div className="mt-6 flex-1 sm:mt-0">
            <p>Project cover image</p>

            <div
              className="h-48 rounded-xl bg-gray-200 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("${application.bannerImageUrl}")`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 dark:text-white">
        <b className="text-lg">Contribution & Impact</b>

        <MarkdownField
          required
          body={<Markdown>{application.contributionDescription}</Markdown>}
          title="Contribution description"
        />

        <MarkdownField
          required
          body={<Markdown>{application.impactDescription}</Markdown>}
          title="Impact description"
        />

        <ValueField
          required
          body={application.impactCategory?.map((tag) => (
            <Tag key={tag} selected size="sm">
              {Object.keys(impactCategories).includes(tag) && (
                <span>{impactCategories[tag as keyof typeof impactCategories].label}</span>
              )}
            </Tag>
          ))}
          title="Impact categories"
        />

        <ValueField
          body={application.contributionLinks?.map((link) => (
            <LinkField key={link.description} contributionLink={link} />
          ))}
          title="Contribution links"
        />

        <ValueField
          body={application.fundingSources?.map((link) => <LinkField key={link.description} fundingSource={link} />)}
          title="Funding sources"
        />
      </div>

      <b className="text-lg">Project Preview Card</b>

      <p className="text-sm">This is how your project will look in the dashboard:</p>

      <div className="mb-2 grid w-96 gap-4 sm:grid-cols-2  lg:grid-cols-1">
        <ProjectItem
          isLoading={false}
          pollId=""
          recipient={{
            ...application,
            id: "no-id",
            metadataUrl: "",
            payout: application.payoutAddress as Hex,
            index: "0",
            bannerImageUrl: application.bannerImageUrl,
            profileImageUrl: application.profileImageUrl,
            name: application.name,
            bio: application.bio,
            impactCategory: application.impactCategory,
          }}
        />
      </div>
    </div>
  );
};
