import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/remix";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { request, gql } from "graphql-request";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";

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

export async function loader(args: LoaderFunctionArgs) {
  const data = await request<Data>({
    url: process.env.API_BASE_URL,
    document,
    requestHeaders: args.request.headers,
  });

  return data;
}

function AuthRow() {
  return (
    <div className="flex flex-row items-center min-h-10">
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
  );
}

function Sidebar() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="p-8 border-r h-full">
      <AuthRow />
      <ul>
        {data.projects.map((project) => (
          <li key={project.id}>
            <Link to={`/projects/${project.id}`}>{project.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Layout() {
  return (
    // TODO: persist sizing in a cookie to handle SSR
    <ResizablePanelGroup className="min-h-dvh" direction="horizontal">
      <ResizablePanel defaultSize={15} maxSize={15}>
        <Sidebar />
      </ResizablePanel>
      <ResizableHandle withHandle={false} />
      <ResizablePanel defaultSize={85} className="p-8">
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
