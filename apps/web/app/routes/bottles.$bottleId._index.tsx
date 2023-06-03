import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import EmptyActivity from "~/components/emptyActivity";
import TastingList from "~/components/tastingList";
import useApi from "~/hooks/useApi";
import { useSuspenseQuery } from "~/hooks/useSuspenseQuery";
import type { Paginated, Tasting } from "~/types";

export async function loader({ params: { bottleId }, context }: LoaderArgs) {
  invariant(bottleId);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    ["bottle", bottleId, "tastings"],
    (): Promise<Paginated<Tasting>> =>
      context.api.get(`/tastings`, {
        query: { bottle: bottleId },
      }),
  );

  return json({ dehydratedState: dehydrate(queryClient) });
}

export default function BottleActivity() {
  const api = useApi();

  const { bottleId } = useParams<"bottleId">();
  invariant(bottleId);

  const { data: tastingList } = useSuspenseQuery(
    ["bottle", bottleId, "tastings"],
    (): Promise<Paginated<Tasting>> =>
      api.get(`/tastings`, {
        query: { bottle: bottleId },
      }),
  );

  return (
    <>
      {tastingList.results.length ? (
        <TastingList values={tastingList.results} noBottle />
      ) : (
        <EmptyActivity to={`/bottles/${bottleId}/addTasting`}>
          <span className="mt-2 block font-semibold ">
            Are you enjoying a dram?
          </span>

          <span className="mt-2 block font-light">
            Looks like no ones recorded this spirit. You could be the first!
          </span>
        </EmptyActivity>
      )}
    </>
  );
}