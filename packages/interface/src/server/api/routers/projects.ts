import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { config, eas } from "~/config";
import { type Filter, FilterSchema, OrderBy, SortOrder } from "~/features/filter/types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchAttestations } from "~/utils/fetchAttestations";
import { createDataFilter, createSearchFilter } from "~/utils/fetchAttestationsUtils";
import { fetchMetadata } from "~/utils/fetchMetadata";

import type { Attestation } from "~/utils/types";

export const projectsRouter = createTRPCRouter({
  count: publicProcedure.query(async () =>
    fetchAttestations([eas.schemas.approval], {
      where: {
        attester: { equals: config.admin },
        AND: [createDataFilter("type", "bytes32", "application"), createDataFilter("round", "bytes32", config.roundId)],
      },
    }).then((attestations = []) =>
      // Handle multiple approvals of an application - group by refUID
      ({
        count: Object.keys(attestations.reduce((acc, x) => ({ ...acc, [x.refUID]: true }), {})).length,
      }),
    ),
  ),

  get: publicProcedure.input(z.object({ ids: z.array(z.string()) })).query(async ({ input: { ids } }) => {
    if (!ids.length) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return fetchAttestations([eas.schemas.metadata], {
      where: { id: { in: ids } },
    });
  }),

  getByTransactionId: publicProcedure
    .input(z.object({ transactionId: z.string() }))
    .query(async ({ input: { transactionId } }) =>
      fetchAttestations([eas.schemas.metadata], {
        where: { txid: { equals: transactionId } },
      }).then((applications) => applications[0]),
    ),

  search: publicProcedure.input(FilterSchema).query(async ({ input }) => {
    const filters = [
      createDataFilter("type", "bytes32", "application"),
      createDataFilter("round", "bytes32", config.roundId),
    ];

    if (input.search) {
      filters.push(createSearchFilter(input.search));
    }

    if (input.needApproval) {
      return fetchAttestations([eas.schemas.approval], {
        where: {
          attester: { equals: config.admin },
          ...createDataFilter("type", "bytes32", "application"),
        },
      }).then((attestations = []) => {
        const approvedIds = attestations.map(({ refUID }) => refUID).filter(Boolean);

        return fetchAttestations([eas.schemas.metadata], {
          take: input.limit,
          skip: input.cursor * input.limit,
          orderBy: [createOrderBy(input.orderBy, input.sortOrder)],
          where: {
            id: { in: approvedIds },
            AND: filters,
          },
        });
      });
    }

    return fetchAttestations([eas.schemas.metadata], {
      take: input.limit,
      skip: input.cursor * input.limit,
      orderBy: [createOrderBy(input.orderBy, input.sortOrder)],
      where: {
        attester: { equals: config.admin },
        AND: filters,
      },
    });
  }),

  // Used for distribution to get the projects' payoutAddress
  // To get this data we need to fetch all projects and their metadata
  payoutAddresses: publicProcedure.input(z.object({ ids: z.array(z.string()) })).query(async ({ input }) =>
    fetchAttestations([eas.schemas.metadata], {
      where: { id: { in: input.ids } },
    })
      .then((attestations) =>
        Promise.all(
          attestations.map((attestation) =>
            fetchMetadata(attestation.metadataPtr).then((data) => {
              const { payoutAddress } = data as unknown as {
                payoutAddress: string;
              };

              return { projectId: attestation.id, payoutAddress };
            }),
          ),
        ),
      )
      .then((projects) => projects.reduce((acc, x) => ({ ...acc, [x.projectId]: x.payoutAddress }), {})),
  ),

  allApproved: publicProcedure.query(async () => {
    const filters = [
      createDataFilter("type", "bytes32", "application"),
      createDataFilter("round", "bytes32", config.roundId),
    ];

    return fetchAttestations([eas.schemas.approval], {
      where: {
        attester: { equals: config.admin },
        ...createDataFilter("type", "bytes32", "application"),
      },
    }).then((attestations = []) => {
      const approvedIds = attestations.map(({ refUID }) => refUID).filter(Boolean);

      return fetchAttestations([eas.schemas.metadata], {
        orderBy: [createOrderBy(OrderBy.time, SortOrder.asc)],
        where: {
          id: { in: approvedIds },
          AND: filters,
        },
      });
    });
  }),
});

export async function getAllApprovedProjects(): Promise<Attestation[]> {
  const filters = [
    createDataFilter("type", "bytes32", "application"),
    createDataFilter("round", "bytes32", config.roundId),
  ];

  return fetchAttestations([eas.schemas.approval], {
    where: {
      attester: { equals: config.admin },
      ...createDataFilter("type", "bytes32", "application"),
    },
  }).then((attestations = []) => {
    const approvedIds = attestations.map(({ refUID }) => refUID).filter(Boolean);

    return fetchAttestations([eas.schemas.metadata], {
      orderBy: [createOrderBy(OrderBy.time, SortOrder.asc)],
      where: {
        id: { in: approvedIds },
        AND: filters,
      },
    });
  });
}

function createOrderBy(orderBy: Filter["orderBy"], sortOrder: Filter["sortOrder"]) {
  const key = {
    time: "time",
    name: "decodedDataJson",
  }[orderBy];

  return { [key]: sortOrder };
}
