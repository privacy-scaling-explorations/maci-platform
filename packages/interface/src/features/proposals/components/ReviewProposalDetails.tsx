import clsx from "clsx";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import Markdown from "react-markdown";
import { useAccount } from "wagmi";

import { Heading } from "~/components/ui/Heading";
import { markdownComponents } from "~/components/ui/MarkdownComponents";
import { Tag } from "~/components/ui/Tag";
import { impactCategories } from "~/config";
import { ProjectContacts } from "~/features/projects/components/ProjectContacts";

import type { Metadata } from "../types";

import { LinkField } from "./LinkField";

interface IValueFieldProps {
  title: string;
  body?: ReactNode;
  link?: string;
}

const ValueField = ({ title, body = undefined, link = undefined }: IValueFieldProps): JSX.Element => {
  const emptyPlaceholder = "(empty)";

  return (
    <div className="flex flex-col gap-2 text-xs sm:text-sm">
      <h4 className={clsx("text-lg font-bold uppercase leading-[27px] text-black dark:text-white")}>{title}</h4>

      <div className="text-light flex flex-col flex-wrap gap-2 break-all text-gray-400">
        {body === undefined && emptyPlaceholder}

        {Array.isArray(body) && body.length === 0 && emptyPlaceholder}

        {typeof body === "string" && body.length === 0 && emptyPlaceholder}

        {((typeof body === "string" && body.length > 0) || typeof body !== "string") && link && (
          <Link className="hover:underline" href={link} target="_blank">
            {body}
          </Link>
        )}

        {((typeof body === "string" && body.length > 0) || typeof body !== "string") && !link && body}
      </div>
    </div>
  );
};

export const ReviewProposalDetails = (): JSX.Element => {
  const form = useFormContext<Metadata>();

  const metadata = useMemo(() => form.getValues(), [form]);

  const { address } = useAccount();

  return (
    <div className="markdown-support flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <Heading className="font-sans text-2xl font-bold leading-[36px]">Review & Submit</Heading>

        <span className="font-sans text-base font-normal leading-loose text-gray-400">
          Please review and submit your project application.
        </span>
      </div>

      <div className="relative mb-[33px]">
        <div
          className="h-48 rounded-xl bg-gray-200 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${metadata.bannerImageUrl}")`,
          }}
        />

        <div
          className="z-1 absolute bottom-[-53px] left-[20px] h-[106px] w-[106px] rounded-full border border-white bg-gray-200 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${metadata.profileImageUrl}")`,
            filter: `drop-shadow(0px 1px 1px rgba(48, 49, 51, 0.10)) drop-shadow(0px 0px 1px rgba(48, 49, 51, 0.05))`,
          }}
        />
      </div>

      <div className="flex flex-col gap-[30px]">
        <h3 className="font-mono text-[32px] font-normal uppercase tracking-[0.32px] text-black dark:text-white">
          {metadata.name || "Project Name"}
        </h3>

        <span className="font-sans text-lg font-normal leading-[27px] text-gray-400">
          {metadata.shortBio || "Short description"}
        </span>

        <ProjectContacts
          author={address}
          github={metadata.github}
          twitter={metadata.twitter}
          website={metadata.websiteUrl}
        />
      </div>

      <div className="flex flex-col gap-6 dark:text-white">
        <ValueField
          body={<Markdown components={markdownComponents}>{metadata.bio || "lorem ipsum dolor sit amet "}</Markdown>}
          title="ABOUT THE PROJECT"
        />
      </div>

      <div className="flex flex-col gap-6 dark:text-white">
        <ValueField body={<Markdown>{metadata.contributionDescription}</Markdown>} title="Contribution description" />

        <ValueField body={<Markdown>{metadata.impactDescription}</Markdown>} title="Impact description" />

        <ValueField
          body={
            <div className="flex gap-2">
              {metadata.impactCategory?.map((tag) => (
                <Tag key={tag} selected size="sm">
                  {Object.keys(impactCategories).includes(tag) && (
                    <span>{impactCategories[tag as keyof typeof impactCategories].label}</span>
                  )}
                </Tag>
              ))}
            </div>
          }
          title="Impact categories"
        />

        <ValueField
          body={metadata.contributionLinks?.map((link) => <LinkField key={link.description} contributionLink={link} />)}
          title="Contribution links"
        />

        <ValueField
          body={metadata.fundingSources?.map((link) => <LinkField key={link.description} fundingSource={link} />)}
          title="Funding sources"
        />
      </div>
    </div>
  );
};
