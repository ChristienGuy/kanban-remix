import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { request, gql } from "graphql-request";
import { Card, CardTitle } from "~/components/ui/card";

const document = gql`
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

export async function loader(args: LoaderFunctionArgs) {
  const data = await request<Data>("http://localhost:4000", document, {
    projectId: args.params.projectId,
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

export default function Page() {
  const data = useLoaderData<typeof loader>();
  console.log("data", data);

  return (
    <div>
      <h1>{data.project.title}</h1>
      <ul className="grid grid-cols-2 gap-4">
        {data.project.tags.map((tag) => (
          <li className="bg-gray-100 rounded-xl p-2" key={tag.id}>
            <h2>{tag.name}</h2>
            <ul>
              {tag.tasks.map((task) => (
                <li key={task.id}>
                  <Card className="p-4">
                    <CardTitle>{task.title}</CardTitle>
                  </Card>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
