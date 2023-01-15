import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetStaticProps,
} from "next";
import Link from "next/link";

import { User } from "../../src/interfaces";
import { sampleUserData } from "../../src/utils/sample-data";
import Layout from "../../src/components/Layout";
import List from "../../src/components/List";
import { options } from "../api/auth/[...nextauth]";
import { dehydrate, useQuery } from "@tanstack/react-query";
import { getReactQueryClientSSRSession } from "../../src/helpers/SsrRTKQueryPrefetchSession";
import UserService from "../../src/services/user.service";
import { useSession } from "../../src/customHooks/useReactQuerySession";
import { Fragment } from "react";

const UsersPageWithSSR = () => {
  const authObject = useSession();
  console.log(authObject);
  const { data: userList = [], isLoading: userListIsLoading } = useQuery<
    User[]
  >(
    ["user-list"],
    () => {
      return UserService.getUsers().then((x) => {
        return x;
      });
    },
    {
      enabled: authObject.isAuthenticated,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  return (
    <Fragment>
      <h1>Users List</h1>
      <p>
        Example fetching data from inside <code>getServerSideProps()</code>.
      </p>
      <p>You are currently on: /users</p>
      <List items={userList} />
      <p>
        <Link href="/">Go home</Link>
      </p>
    </Fragment>
  );
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { queryClient, session } = await getReactQueryClientSSRSession(
    context,
    options
  );
  console.log("osama");
  queryClient.prefetchQuery<User[]>(["user-list"], () =>
    UserService.getUsers(session).then((x) => {
      return x;
    })
  );
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

export default UsersPageWithSSR;
