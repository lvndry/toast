import Link from "next/link";
import { getDictionary } from "~/lib/get-dictionary";

import { FeaturesGrid } from "~/components/features-grid";
import { RightsideMarketing } from "~/components/rightside-marketing";

import { BackgroundLines } from "@saasfly/ui/background-lines";
import { Button } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

import { FaAirbnb, FaFacebook, FaGoogle, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import type { Locale } from "~/config/i18n-config";


export default async function IndexPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);

  return (
    <>
      <section className="container">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-2">
          <div className="flex flex-col items-start h-full">
            <BackgroundLines className="h-full">
              <div className="flex flex-col pt-4 md:pt-36 lg:pt-36 xl:pt-36">
                <div className="mt-20">
                  <div
                    className="mb-6 max-w-4xl text-left text-4xl font-semibold dark:text-zinc-100 md:text-5xl xl:text-5xl md:leading-[4rem] xl:leading-[4rem]">
                    {dict.marketing.title || "Ship your apps to the world easier with "}
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-neutral-500 dark:text-neutral-400 sm:text-lg">
                    {dict.marketing.sub_title || "Your complete All-in-One solution for building SaaS services."}
                  </span>
                </div>

                <div
                  className="mb-4 mt-6 flex w-full flex-col justify-center space-y-4 sm:flex-row sm:justify-start sm:space-x-8 sm:space-y-0 z-10">
                  <Link href="/companies">
                    <Button
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-full text-lg px-6 h-12 font-medium">
                      {dict.marketing.get_started}
                      <Icons.ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </BackgroundLines>
          </div>

          <div className="hidden h-full w-full xl:block bg-background">
            <div className="flex flex-col pt-44">
              <RightsideMarketing dict={dict.marketing.right_side} />
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <FeaturesGrid dict={dict.marketing.features_grid} />
      </section>

      <section className="container pt-24">
        <div className="flex flex-col justify-center items-center pt-10">
          <div className="text-lg text-neutral-500 dark:text-neutral-400">{dict.marketing.sponsor.title}</div>
          <div className="mt-4 flex items-center gap-4">
            <Link href="https://facebook.com" target="_blank" aria-label="Facebook">
              <FaFacebook size={48} />
            </Link>
            <Link href="https://google.com" target="_blank" aria-label="Google">
              <FaGoogle size={48} />
            </Link>
            <Link href="https://youtube.com" target="_blank" aria-label="YouTube">
              <FaYoutube size={48} />
            </Link>
            <Link href="https://tiktok.com" target="_blank" aria-label="TikTok">
              <FaTiktok size={48} />
            </Link>
            <Link href="https://instagram.com" target="_blank" aria-label="Instagram">
              <FaInstagram size={48} />
            </Link>
            <Link href="https://airbnb.com" target="_blank" aria-label="Airbnb">
              <FaAirbnb size={48} />
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6">Pricing</h2>
          <div className="w-full max-w-2xl grid grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="rounded-xl border bg-white dark:bg-neutral-900/40 p-6 flex flex-col items-center shadow">
              <h3 className="text-xl font-semibold mb-2">Basic</h3>
              <p className="text-3xl font-bold mb-4">$0</p>
              <ul className="mb-4 space-y-2 text-left w-full">
                <li>✅ Access top 100 companies</li>
                <li>✅ Community support</li>
                <li>✅ Basic analytics</li>
              </ul>
              <span className="inline-block rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-medium">Current</span>
            </div>
            {/* Premium Plan */}
            <div className="rounded-xl border bg-gray-100 dark:bg-neutral-800/40 p-6 flex flex-col items-center opacity-60 cursor-not-allowed">
              <h3 className="text-xl font-semibold mb-2">Premium</h3>
              <p className="text-3xl font-bold mb-4">Coming Soon</p>
              <ul className="mb-4 space-y-2 text-left w-full">
                <li>✅ Everything in basic</li>
                <li>✅ Unlimited access to all companies</li>
                <li>✅ Advanced analytics</li>
                <li>✅ Priority support</li>
                <li>✅ Team collaboration</li>
                <li>✅ Early access to new features</li>
              </ul>
              <span className="inline-block rounded-full bg-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">Coming Soon</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
