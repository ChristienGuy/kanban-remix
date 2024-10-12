import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { request as gqlRequest, gql } from "graphql-request";
import { Button } from "~/components/ui/button";
import { Card, CardTitle } from "~/components/ui/card";

const getProjectDocument = gql`
  query Project($projectId: ID) {
    project(id: $projectId) {
      title
      tasks {
        tags {
          id
          name
          tasks {
            id
            title
          }
        }
      }
    }
  }
`;

type Data = {
  project: {
    title: string;
    tasks: {
      tags: {
        id: string;
        name: string;
        tasks: {
          id: string;
          title: string;
        }[];
      }[];
    }[];
  };
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  if (!process.env.API_BASE_URL) {
    throw new Error("API_BASE_URL is not set");
  }

  const data = await gqlRequest<Data>({
    url: process.env.API_BASE_URL,
    document: getProjectDocument,
    variables: {
      projectId: params.projectId,
    },
    requestHeaders: request.headers,
  });

  const tags = data.project.tasks.flatMap((task) => task.tags);

  // TODO: move this to the server in some way
  // Perhaps add a `taskTags` field to the Project model
  return {
    project: {
      title: data.project.title,
      tags,
    },
  };
}

// const createTaskDocument = gql`
//   mutation CreateTask($title: String!, $projectId: ID!) {
//     createTask(title: $title, projectId: $projectId) {
//       id
//       title
//     }
//   }
// `;

// export async function action({ request }: ActionFunctionArgs) {
//   const body = await request.formData();
// }

function BoardColumn({ children }: { children: React.ReactNode }) {
  return <li className="bg-gray-100 rounded-xl p-3 grid gap-4">{children}</li>;
}

function BoardList({ children }: { children: React.ReactNode }) {
  return <ul className="grid grid-cols-2 gap-4">{children}</ul>;
}

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="grid gap-8">
      <h1 className="font-medium">{data.project.title}</h1>
      <BoardList>
        {data.project.tags.map((tag) => (
          <BoardColumn key={tag.id}>
            <h2 className="text-gray-800 font-medium ml-1">{tag.name}</h2>
            <ul className="grid gap-2">
              {tag.tasks.map((task) => (
                <li key={task.id}>
                  <Card className="p-4">
                    <CardTitle>{task.title}</CardTitle>
                  </Card>
                </li>
              ))}
              <li>
                <Button
                  variant="secondary"
                  className=" shadow-none rounded-xl border border-dashed w-full p-2"
                >
                  <span className="text-gray-500">Add a task</span>
                </Button>
              </li>
            </ul>
          </BoardColumn>
        ))}
      </BoardList>
    </div>
  );
}
