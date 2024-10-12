import { getAuth } from "@clerk/remix/ssr.server";
import {
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { request, gql } from "graphql-request";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

export const meta: MetaFunction = () => {
  return [
    { title: "Kanban Remix" },
    { name: "description", content: "Remix powered Kanban board" },
  ];
};

const document = gql`
  query GetTasks {
    tasks {
      id
      title
      tags {
        name
      }
    }
  }
`;

type Data = {
  tasks: {
    id: string;
    title: string;
    tags: {
      name: string;
    }[];
  }[];
};

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }

  const response = await request<Data>("http://localhost:4000", document);

  return {
    response,
  };
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <div className="grid grid-cols-4">
        <ul>
          {data.response.tasks.map((task) => (
            <li key={task.id}>
              <Card>
                <CardContent>
                  <CardTitle>{task.title}</CardTitle>
                  <ul>
                    {task.tags.map((tag) => (
                      <li key={tag.name}>{tag.name}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
