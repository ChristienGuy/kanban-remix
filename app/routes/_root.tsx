import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/remix";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { request, gql } from "graphql-request";

const document = gql`
  query GetProjects {
    projects {
      id
      title
    }
  }
`;

type Data = {
  projects: {
    id: string;
    title: string;
  }[];
};

export async function loader() {
  const data = await request<Data>("http://localhost:4000", document);

  return data;
}

export default function Layout() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-1">
        <div className="flex flex-row items-center">
          <SignedIn>
            <div>
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <div>
              <SignInButton />
            </div>
            <div>
              <SignUpButton />
            </div>
          </SignedOut>
        </div>
        <ul>
          {data.projects.map((project) => (
            <li key={project.id}>
              <Link to={`/projects/${project.id}`}>{project.title}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-11 p-8">
        <Outlet />
      </div>
    </div>
  );
}
