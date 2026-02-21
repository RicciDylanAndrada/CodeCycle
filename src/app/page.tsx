import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

const HomePage = async () => {
  const user = await getAuthUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
};

export default HomePage;
