import useUser from "@/hooks/auth/useUser";
import { Redirect } from "expo-router";
import Loader from "@/components/loader/loader";

export default function TabsIndex() {
  const { loading, user } = useUser();

  console.log("Loading:", loading);
  console.log("User:", user);

  
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Redirect href={user ? "/(tabs)" : "/(routes)/bemvindo"} />
      )}
    </>
  );
}
