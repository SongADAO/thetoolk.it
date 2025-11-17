/* eslint-disable react/no-multi-comp, no-inline-comments, max-lines */
import type { Metadata } from "next";
import Image from "next/image";
import { type ReactNode, useState } from "react";

import { AppFooter } from "@/components/AppFooter";
import { AppLogo } from "@/components/AppLogo";

interface AccordionSectionProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

interface ScreenshotButtonProps {
  readonly imagePath: string;
  readonly altText: string;
}

function ScreenshotButton({ imagePath, altText }: ScreenshotButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 transition-colors hover:bg-blue-200"
        onClick={() => setIsModalOpen(true)}
        title="View screenshot"
        type="button"
      >
        <svg
          className="h-4 w-4 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <path
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </button>

      {isModalOpen ? (
        <div
          className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-h-[95vh] max-w-6xl rounded-lg bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 z-10 text-2xl font-bold text-gray-500 hover:text-gray-700"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              ×
            </button>
            <Image
              alt={altText}
              className="max-h-full max-w-full object-contain"
              height={800}
              src={imagePath}
              width={1200}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

function AccordionSection({
  title,
  children,
  isOpen,
  onToggle,
}: AccordionSectionProps) {
  return (
    <section className="mb-4">
      <button
        className="flex w-full items-center justify-between rounded-t-lg border border-gray-300 bg-gray-100 p-4 text-left hover:bg-gray-200"
        onClick={onToggle}
        type="button"
      >
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        <span
          className="transform text-2xl text-gray-600 transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>
      {isOpen ? (
        <div className="rounded-b-lg border-x border-b border-gray-300 bg-white p-6">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export const metadata: Metadata = {
  alternates: {
    canonical: "/instructions",
  },
  description:
    "TheToolk.it is a free web app for cross-posting across social media. This page contains setup instructions for using the app.",
  title: "Instructions - TheToolk.it",
};

export default function InstructionsPage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 right-0 left-0 z-40">
        <div className="flex items-center justify-between bg-gray-200 p-2">
          <h1>
            <AppLogo />
          </h1>
          <span className="text-md text-gray-600">Setup Instructions</span>
        </div>
      </header>

      {/* Main Content with top padding to account for fixed header */}
      <main className="flex-1 pt-16 pb-16">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h1 className="mb-6 text-3xl font-bold text-gray-900">
              TheToolkit Setup Instructions
            </h1>

            {/* Welcome Section */}
            <section className="mb-8">
              <div className="space-y-4">
                <p className="text-gray-700">
                  Welcome to www.thetoolk.it! This is a completely free app for
                  cross-posting across social media. You can use this web
                  version or{" "}
                  <a
                    className="text-blue-600 underline hover:text-blue-800"
                    href="https://github.com/SongADAO/thetoolk.it"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    self-host it via GitHub
                  </a>
                  .
                </p>
                <p className="text-gray-700">
                  The setup instructions below are the same for both. I&apos;ve
                  tried to make them as clear as possible, but every service has
                  its own quirks!
                </p>
                <p className="text-gray-700">
                  Keep in mind, we don&apos;t get access to any of your API keys
                  or credentials for any of these sites; they are saved locally
                  on your browser.
                </p>
              </div>
            </section>

            {/* Roadmap Section */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800">
                Roadmap
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium text-gray-700">
                    Paid Version
                  </h3>
                  <p className="text-gray-600">
                    If there&apos;s enough demand, we may offer a paid version
                    that handles all API credentials for you—no setup required.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-gray-700">TikTok</h3>
                  <p className="text-gray-600">
                    We&apos;re waiting for TikTok API access approval. Once
                    approved, we&apos;ll update these instructions with steps to
                    get your own access.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-gray-700">
                    Web3 Integration
                  </h3>
                  <p className="text-gray-600">
                    Coming soon: Manifold minting, Zora coins, Rodeo, NFT
                    auctions, GBM auctions, InProcess, Forever Library, and
                    more.
                  </p>
                </div>

                <div className="rounded border border-blue-200 bg-blue-50 p-4">
                  <p className="text-gray-700">
                    Want to request a web2 or web3 integration?{" "}
                    <a
                      className="text-blue-600 underline hover:text-blue-800"
                      href="http://x.com/songadaymann"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Send me a DM
                    </a>{" "}
                    and I&apos;ll add it to the list (no guarantees though!).
                  </p>
                  <p className="mt-2 text-gray-700">
                    Since this project is open source, you&apos;re always
                    welcome to add features yourself!
                  </p>
                </div>
              </div>
            </section>

            <AccordionSection
              isOpen={openSections.storage}
              onToggle={() => toggleSection("storage")}
              title="Storage Services"
            >
              <div className="space-y-8">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-700">
                    Amazon S3
                  </h3>
                  <div className="mb-4 rounded border border-red-200 bg-red-50 p-4">
                    <p className="font-medium text-red-800">⚠️ Warning:</p>
                    <p className="mt-2 text-red-700">
                      If you need to follow a guide to setup an Amazon S3
                      account, it&apos;s better that you don&apos;t use Amazon
                      S3! Take it from me: It&apos;s very confusing and can
                      easily result in huge accidental bills. Just use Pinata if
                      you don&apos;t already know how to use Amazon S3.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-700">
                    Pinata
                  </h3>
                  <p className="mb-4 text-gray-700">
                    If you want to upload media via TheToolkit, you&apos;ll need
                    somewhere for that media to live. Pinata is the best option.
                  </p>

                  <div className="mb-4">
                    <h4 className="text-md mb-2 font-medium text-gray-700">
                      What you need:
                    </h4>
                    <ul className="ml-4 space-y-1 text-gray-600">
                      <li>• API Key</li>
                      <li>• API Secret</li>
                      <li>• JWT (secret access token)</li>
                      <li>• Gateway</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-md mb-3 font-medium text-gray-700">
                      Setup steps:
                    </h4>
                    <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                      <li>
                        Go to{" "}
                        <a
                          className="text-blue-600 underline hover:text-blue-800"
                          href="https://app.pinata.cloud/auth/signin"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          https://app.pinata.cloud/auth/signin
                        </a>
                      </li>
                      <li>Log in or create an account</li>
                      <li>
                        Click on <strong>API Keys</strong>
                        <ScreenshotButton
                          altText="Click on API Keys"
                          imagePath="/screenshots/PINATA/Pinata1.png"
                        />
                      </li>
                      <li>
                        Click on <strong>+New Key</strong>
                        <ScreenshotButton
                          altText="Click on +New Key"
                          imagePath="/screenshots/PINATA/Pinata2.png"
                        />
                      </li>
                      <li>Give your API key a name (anything is fine)</li>
                      <li>
                        Make sure to turn on <strong>Admin</strong>
                      </li>
                      <li>
                        Click <strong>Create</strong>
                      </li>
                      <li>
                        Copy your API Key, API Secret and JWT to a safe place
                        (you can&apos;t see them again after this)
                      </li>
                      <li className="font-medium text-red-600">
                        NEVER SHARE THESE WITH ANYONE
                      </li>
                      <li>
                        Click on <strong>Gateways</strong>
                        <ScreenshotButton
                          altText="Click on Gateways"
                          imagePath="/screenshots/PINATA/Pinata5.png"
                        />
                      </li>
                      <li>
                        Click on <strong>+Create</strong>
                      </li>
                      <li>Give your gateway a name (can be anything)</li>
                    </ol>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md mb-3 font-medium text-gray-700">
                      Connect to TheToolkit:
                    </h4>
                    <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                      <li>Head to www.thetoolk.it</li>
                      <li>
                        Click on <strong>Pinata</strong>
                      </li>
                      <li>Enter your API Key, API Secret, JWT and gateway</li>
                      <li>
                        Click <strong>Save API Settings</strong>
                      </li>
                      <li className="font-medium text-green-600">
                        You&apos;re done! 🎉
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection
              isOpen={openSections.bluesky}
              onToggle={() => toggleSection("bluesky")}
              title="Bluesky"
            >
              <div className="space-y-6">
                <div className="mb-4">
                  <h4 className="text-md mb-2 font-medium text-gray-700">
                    What you need:
                  </h4>
                  <ul className="ml-4 space-y-1 text-gray-600">
                    <li>
                      • Service URL (most likely https://bsky.social/ unless you
                      know what you&apos;re doing)
                    </li>
                    <li>• Username</li>
                    <li>• Password</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-md mb-3 font-medium text-gray-700">
                    Setup steps:
                  </h4>
                  <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                    <li>Head to www.thetoolk.it</li>
                    <li>
                      Click on <strong>Bluesky</strong>
                    </li>
                    <li>Enter your Service URL, username and password</li>
                    <li>
                      Click <strong>Save API Settings</strong>
                    </li>
                    <li>
                      Click <strong>Authorize</strong>
                    </li>
                    <li>Follow the prompts</li>
                    <li className="font-medium text-green-600">
                      You&apos;re done! 🎉
                    </li>
                  </ol>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection
              isOpen={openSections.farcaster}
              onToggle={() => toggleSection("farcaster")}
              title="Farcaster"
            >
              <p className="mb-4 text-gray-700">
                We&apos;ll use Neynar for this. They&apos;re free at first, then
                about a dollar a year.
              </p>

              <div className="mb-4">
                <h4 className="text-md mb-2 font-medium text-gray-700">
                  What you need:
                </h4>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• Client ID</li>
                  <li>• API Key</li>
                </ul>
              </div>

              <div>
                <h4 className="text-md mb-3 font-medium text-gray-700">
                  Setup steps:
                </h4>
                <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                  <li>
                    Go to{" "}
                    <a
                      className="text-blue-600 underline hover:text-blue-800"
                      href="https://neynar.com"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      neynar.com
                    </a>
                  </li>
                  <li>Log in or create an account</li>
                  <li>
                    Click on the <strong>Connect Farcaster</strong> button and
                    follow the prompts
                  </li>
                  <li>
                    Click on <strong>Apps</strong> in the sidebar
                  </li>
                  <li>Copy the Client ID and save it somewhere safe</li>
                  <li>Copy the API Key and save it somewhere safe</li>
                  <li className="font-medium text-red-600">
                    NEVER SHARE THESE WITH ANYONE
                  </li>
                  <li>
                    Click on <strong>SIWN</strong> and enter{" "}
                    <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                      https://www.thetoolk.it
                    </code>{" "}
                    under <strong>Authorized origins</strong>
                    <ScreenshotButton
                      altText="Click on SIWN and enter authorized origins"
                      imagePath="/screenshots/Farcaster.png"
                    />
                  </li>
                </ol>
              </div>

              <div className="mt-6">
                <h4 className="text-md mb-3 font-medium text-gray-700">
                  Connect to TheToolkit:
                </h4>
                <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                  <li>Head to www.thetoolk.it</li>
                  <li>
                    Click on <strong>Farcaster</strong>
                  </li>
                  <li>Enter your Client ID and API Key</li>
                  <li>
                    Click <strong>Save API Settings</strong>
                  </li>
                  <li>
                    Click <strong>Authorize</strong>
                  </li>
                  <li>Follow the prompts</li>
                  <li className="font-medium text-green-600">
                    You&apos;re done! 🎉
                  </li>
                </ol>
              </div>
            </AccordionSection>

            <AccordionSection
              isOpen={openSections.metaPlatforms}
              onToggle={() => toggleSection("metaPlatforms")}
              title="Instagram, Threads and Facebook"
            >
              <div className="mb-6 rounded border border-yellow-200 bg-yellow-50 p-4">
                <p className="font-medium text-yellow-800">⚠️ Complex Setup:</p>
                <p className="mt-2 text-yellow-700">
                  This setup is more complex. You&apos;ll need to create
                  &quot;apps&quot; in the Meta Developer Platform:
                </p>
                <ul className="mt-2 ml-4 space-y-1 text-yellow-700">
                  <li>• One app for Threads & Facebook</li>
                  <li>• A separate app for Instagram</li>
                </ul>
                <p className="mt-2 text-yellow-700">
                  None of this makes any sense. I&apos;m sorry! They don&apos;t
                  make it easy for non-technical people. But you can definitely
                  do it.
                </p>
              </div>

              <div className="space-y-8">
                {/* Meta Developer Account Setup */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-700">
                    Meta Developer Account Setup
                  </h3>
                  <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                    <li>Log in to Facebook</li>
                    <li>
                      If you haven&apos;t signed up for a Meta Developer account
                      yet, do that here:{" "}
                      <a
                        className="text-blue-600 underline hover:text-blue-800"
                        href="https://developers.facebook.com/async/registration"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        https://developers.facebook.com/async/registration
                      </a>
                    </li>
                  </ol>
                </div>

                {/* Instagram */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-700">
                    Instagram
                  </h3>

                  <div className="mb-4">
                    <h4 className="text-md mb-2 font-medium text-gray-700">
                      What you need:
                    </h4>
                    <ul className="ml-4 space-y-1 text-gray-600">
                      <li>• App ID</li>
                      <li>• App Secret</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-md mb-3 font-medium text-gray-700">
                      Create the Instagram app:
                    </h4>
                    <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                      <li>
                        Go to{" "}
                        <a
                          className="text-blue-600 underline hover:text-blue-800"
                          href="https://developers.facebook.com"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          developers.facebook.com
                        </a>
                      </li>
                      <li>
                        Click on <strong>My Apps</strong>
                        <ScreenshotButton
                          altText="Click on My Apps"
                          imagePath="/screenshots/INSTAGRAM/Instagram1.png"
                        />
                      </li>
                      <li>
                        Click on <strong>Create App</strong>
                      </li>
                      <li>Give your app a name (can be anything)</li>
                      <li>Click through the dialog (may or may not show up)</li>
                      <li>
                        Choose <strong>Other</strong> at the bottom of the list,
                        then click <strong>Next</strong>
                        <ScreenshotButton
                          altText="Choose Other at the bottom of the list"
                          imagePath="/screenshots/INSTAGRAM/Instagram5.png"
                        />
                      </li>
                      <li>
                        Choose <strong>Business</strong>
                      </li>
                      <li>
                        Click <strong>Create App</strong>
                      </li>
                      <li>
                        Click <strong>Set up</strong> in the Instagram tile
                      </li>
                    </ol>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-md mb-3 font-medium text-gray-700">
                      API Setup:
                    </h4>
                    <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                      <li>
                        Click on <strong>Instagram</strong>, then{" "}
                        <strong>API setup with Instagram Login</strong>
                        <ScreenshotButton
                          altText="Click on Instagram, then API setup with Instagram Login"
                          imagePath="/screenshots/INSTAGRAM/Instagram13.png"
                        />
                      </li>
                      <li>
                        Copy and save the Instagram app ID and Instagram app
                        secret
                        <ScreenshotButton
                          altText="Copy and save the Instagram app ID and Instagram app secret"
                          imagePath="/screenshots/INSTAGRAM/Instagram6.png"
                        />
                      </li>
                      <li className="font-medium text-red-600">
                        NEVER SHARE THESE WITH ANYONE
                      </li>
                      <li>
                        Click <strong>Setup</strong> at step 3
                      </li>
                      <li>
                        Enter the redirect url:{" "}
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                          https://www.thetoolk.it/authorize
                        </code>{" "}
                        and hit <strong>Save</strong>
                      </li>
                    </ol>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-md mb-3 font-medium text-gray-700">
                      Configure Instagram testers:
                    </h4>
                    <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                      <li>
                        Click on <strong>App roles</strong>, then{" "}
                        <strong>Roles</strong>
                        <ScreenshotButton
                          altText="Click on App roles, then Roles"
                          imagePath="/screenshots/INSTAGRAM/Instagram7.png"
                        />
                      </li>
                      <li>
                        Click on <strong>Add People</strong>
                      </li>
                      <li>
                        Choose <strong>Instagram Tester</strong>, then type your
                        Instagram name into the box and hit Enter when you find
                        it
                      </li>
                      <li>
                        Click on the <strong>Apps and Websites</strong> link and
                        sign in when prompted
                        <ScreenshotButton
                          altText="Click on Apps and Websites link"
                          imagePath="/screenshots/INSTAGRAM/Instagram8.png"
                        />
                      </li>
                      <li>
                        Log in to the Instagram account you&apos;ll want to be
                        posting with
                      </li>
                      <li>
                        Click on <strong>Tester Invites</strong>, then choose{" "}
                        <strong>Accept</strong> and close that tab
                        <ScreenshotButton
                          altText="Click on Tester Invites, then choose Accept"
                          imagePath="/screenshots/INSTAGRAM/Instagram9.png"
                        />
                      </li>
                      <li>
                        Click back to the developer page and refresh the page to
                        make sure it worked (the &quot;pending&quot; should
                        disappear)
                      </li>
                    </ol>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-md mb-3 font-medium text-gray-700">
                      Configure app settings:
                    </h4>
                    <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                      <li>
                        Click on <strong>App settings</strong>, then{" "}
                        <strong>Basic</strong>
                        <ScreenshotButton
                          altText="Click on App settings, then Basic"
                          imagePath="/screenshots/INSTAGRAM/Instagram10.png"
                        />
                        <ul className="mt-2 ml-6 list-inside list-disc space-y-1">
                          <li>
                            Set App domains to:{" "}
                            <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                              https://www.thetoolk.it
                            </code>
                          </li>
                          <li>
                            Switch User data deletion to{" "}
                            <strong>Data deletion callback URL</strong>, then
                            set it to:{" "}
                            <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                              https://www.thetoolk.it/data-delete
                            </code>
                            <ScreenshotButton
                              altText="Switch User data deletion to Data deletion callback URL"
                              imagePath="/screenshots/INSTAGRAM/Instagram12.png"
                            />
                          </li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="text-md mb-3 font-medium text-gray-700">
                      Connect to TheToolkit:
                    </h4>
                    <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                      <li>Head to www.thetoolk.it</li>
                      <li>
                        Click on <strong>Instagram</strong>
                      </li>
                      <li>Enter your App ID and App Secret</li>
                      <li>
                        Click <strong>Save API Settings</strong>
                      </li>
                      <li>
                        Click <strong>Authorize</strong>
                      </li>
                      <li>Follow the prompts</li>
                      <li className="font-medium text-green-600">
                        You&apos;re done 🎉
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Threads */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-700">
                    Threads
                  </h3>

                  <div className="mb-4">
                    <h4 className="text-md mb-2 font-medium text-gray-700">
                      What you need:
                    </h4>
                    <ul className="ml-4 space-y-1 text-gray-600">
                      <li>• App ID</li>
                      <li>• App Secret</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-md mb-3 font-medium text-gray-700">
                      Create the Threads/Facebook app:
                    </h4>
                    <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                      <li>
                        Go to{" "}
                        <a
                          className="text-blue-600 underline hover:text-blue-800"
                          href="https://developers.facebook.com"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          developers.facebook.com
                        </a>
                      </li>
                      <li>
                        Click on <strong>My Apps</strong>
                        <ScreenshotButton
                          altText="Click on My Apps"
                          imagePath="/screenshots/FACEBOOK/Facebook1.png"
                        />
                      </li>
                      <li>
                        Click on <strong>Create App</strong>
                      </li>
                      <li>Give your app a name (can be anything)</li>
                      <li>Click through the dialog (may or may not show up)</li>
                      <li>
                        Under Use Cases, choose{" "}
                        <strong>Access the Threads API</strong> and{" "}
                        <strong>Manage everything on your Page</strong>
                        <ScreenshotButton
                          altText="Choose Access the Threads API and Manage everything on your Page"
                          imagePath="/screenshots/FACEBOOK/Facebook5.png"
                        />
                      </li>
                      <li>
                        Click <strong>Next</strong>
                      </li>
                      <li>
                        If you have a business portfolio, select it (if you
                        want). If you don&apos;t, just click{" "}
                        <strong>Next</strong>
                      </li>
                      <li>
                        Click <strong>Next</strong>, then <strong>Next</strong>{" "}
                        again, then <strong>Go to dashboard</strong>
                      </li>
                      <li>Click through the popup (if it shows up)</li>
                    </ol>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-md mb-3 font-medium text-gray-700">
                      Configure Threads:
                    </h4>
                    <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                      <li>
                        On{" "}
                        <a
                          className="text-blue-600 underline hover:text-blue-800"
                          href="https://developers.facebook.com"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          developers.facebook.com
                        </a>
                        , click on <strong> My Apps</strong>
                      </li>
                      <li>Click on your app</li>
                      <li>
                        Click on{" "}
                        <strong>
                          Customize the Access the Threads API use case
                        </strong>
                      </li>
                      <li>
                        Make sure <strong>threads_basic</strong> and{" "}
                        <strong>threads_content_publish</strong> are added
                        <ScreenshotButton
                          altText="Make sure threads_basic and threads_content_publish are added"
                          imagePath="/screenshots/THREADS/Threads4.png"
                        />
                      </li>
                      <li>
                        Click on <strong>Settings</strong>
                        <ScreenshotButton
                          altText="Click on Settings"
                          imagePath="/screenshots/THREADS/Threads5.png"
                        />
                      </li>
                      <li>
                        Copy the Threads app ID and Threads app secret and save
                        them somewhere safe
                        <ScreenshotButton
                          altText="Copy the Threads app ID and Threads app secret"
                          imagePath="/screenshots/THREADS/Threads6.png"
                        />
                      </li>
                      <li className="font-medium text-red-600">
                        NEVER SHARE THESE WITH ANYONE
                      </li>
                      <li>
                        Set Redirect Callback URLs to:{" "}
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                          https://www.thetoolk.it/authorize
                        </code>{" "}
                        (make sure to hit Enter)
                      </li>
                      <li>
                        Set Uninstall Callback URL to:{" "}
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                          https://www.thetoolk.it/deauthorize
                        </code>
                      </li>
                      <li>
                        Set Delete Callback URL to:{" "}
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                          https://www.thetoolk.it/delete-data
                        </code>
                      </li>
                      <li>
                        Click <strong>Save</strong>
                      </li>
                      <li>
                        Click <strong>App roles</strong> and then{" "}
                        <strong>Roles</strong>
                        <ScreenshotButton
                          altText="Click App roles and then Roles"
                          imagePath="/screenshots/THREADS/Threads7.png"
                        />
                      </li>
                      <li>
                        Click <strong>Add People</strong>
                      </li>
                      <li>
                        Choose <strong>Threads Tester</strong>, then search for
                        your Threads profile and hit Enter when you find it
                        <ScreenshotButton
                          altText="Choose Threads Tester and search for your profile"
                          imagePath="/screenshots/THREADS/Threads8.png"
                        />
                      </li>
                      <li>
                        Click <strong>Add</strong>
                      </li>
                      <li>
                        Click on the link to{" "}
                        <strong>Website Permissions</strong>
                        <ScreenshotButton
                          altText="Click on the link to Website Permissions"
                          imagePath="/screenshots/THREADS/Threads9.png"
                        />
                      </li>
                      <li>
                        Log in to the Threads account you&apos;ll want to post
                        from
                      </li>
                      <li>
                        Click on <strong>Invites</strong> and accept the invite
                        <ScreenshotButton
                          altText="Click on Invites and accept the invite"
                          imagePath="/screenshots/THREADS/Threads10.png"
                        />
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="text-md mb-3 font-medium text-gray-700">
                      Connect to TheToolkit:
                    </h4>
                    <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                      <li>Head to www.thetoolk.it</li>
                      <li>
                        Click on <strong>Threads</strong>
                      </li>
                      <li>Enter your Threads app ID and Threads app secret</li>
                      <li>
                        Click <strong>Save API Settings</strong>
                      </li>
                      <li>
                        Click <strong>Authorize</strong>
                      </li>
                      <li>Follow the prompts</li>
                      <li className="font-medium text-green-600">
                        You&apos;re done with Threads! 🎉
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Facebook */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-700">
                    Facebook
                  </h3>

                  <div className="mb-4">
                    <h4 className="text-md mb-2 font-medium text-gray-700">
                      What you need:
                    </h4>
                    <ul className="ml-4 space-y-1 text-gray-600">
                      <li>• App ID</li>
                      <li>• App Secret</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-md mb-3 font-medium text-gray-700">
                      Configure Facebook (using the same app you created for
                      Threads):
                    </h4>
                    <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                      <li>
                        On{" "}
                        <a
                          className="text-blue-600 underline hover:text-blue-800"
                          href="https://developers.facebook.com"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          developers.facebook.com
                        </a>
                        , click on <strong>My Apps</strong>
                        <ScreenshotButton
                          altText="Click on My Apps on developers.facebook.com"
                          imagePath="/screenshots/FACEBOOK-PAGES/FBPAGES1.png"
                        />
                      </li>
                      <li>Click on your app</li>
                      <li>
                        Click on{" "}
                        <strong>
                          Customize the Manage everything on your Page use case
                        </strong>
                        <ScreenshotButton
                          altText="Click on Customize the Manage everything on your Page use case"
                          imagePath="/screenshots/FACEBOOK-PAGES/FBPAGES3.png"
                        />
                      </li>
                      <li>
                        Add <strong>pages_manage_posts</strong>,{" "}
                        <strong>pages_read_engagement</strong> and{" "}
                        <strong>pages_show_list</strong>
                        <ScreenshotButton
                          altText="Add pages_manage_posts, pages_read_engagement and pages_show_list"
                          imagePath="/screenshots/FACEBOOK-PAGES/FBPAGES4.png"
                        />
                      </li>
                      <li>
                        Click the <strong>Home</strong> icon to go back to your
                        dashboard
                      </li>
                      <li>
                        Click on <strong>App settings</strong>, then{" "}
                        <strong>Basic</strong>
                        <ScreenshotButton
                          altText="Click on App settings, then Basic"
                          imagePath="/screenshots/FACEBOOK-PAGES/FBPAGES5.png"
                        />
                      </li>
                      <li>
                        Copy and save the App ID and App Secret from the top of
                        the page
                      </li>
                      <li className="font-medium text-red-600">
                        NEVER SHARE THESE WITH ANYONE
                      </li>
                      <li>
                        <ul className="mt-2 ml-6 list-inside list-disc space-y-1">
                          <li>
                            Set App domains to:{" "}
                            <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                              https://www.thetoolk.it
                            </code>
                            <ScreenshotButton
                              altText="Set App domains to www.thetoolk.it"
                              imagePath="/screenshots/FACEBOOK-PAGES/FBPAGES6.png"
                            />
                          </li>
                          <li>
                            Switch User data deletion to{" "}
                            <strong>Data deletion callback URL</strong>, then
                            set it to:{" "}
                            <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                              https://www.thetoolk.it/data-delete
                            </code>
                          </li>
                        </ul>
                      </li>
                      <li>
                        Click <strong>Facebook Login for Business</strong> and
                        then <strong>Settings</strong>. Under{" "}
                        <strong>Valid OAuth Redirect URIs</strong> enter:{" "}
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                          https://www.thetoolk.it/authorize
                        </code>
                        <ScreenshotButton
                          altText="Click Facebook Login for Business and enter Valid OAuth Redirect URIs"
                          imagePath="/screenshots/FACEBOOK-PAGES/FBPAGES7.png"
                        />
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="text-md mb-3 font-medium text-gray-700">
                      Connect to TheToolkit:
                    </h4>
                    <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                      <li>Head to www.thetoolk.it</li>
                      <li>
                        Click on <strong>Facebook</strong>
                      </li>
                      <li>Enter your App ID and App Secret</li>
                      <li>
                        Click <strong>Save API Settings</strong>
                      </li>
                      <li>
                        Click <strong>Authorize</strong>
                      </li>
                      <li>Follow the prompts</li>
                      <li className="font-medium text-green-600">
                        You&apos;re done with Facebook! 🎉
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection
              isOpen={openSections.twitter}
              onToggle={() => toggleSection("twitter")}
              title="Twitter/X"
            >
              <div className="mb-4">
                <h4 className="text-md mb-2 font-medium text-gray-700">
                  What you need:
                </h4>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• OAuth 2.0 Client ID</li>
                  <li>• OAuth 2.0 Client Secret</li>
                </ul>
              </div>

              <div>
                <h4 className="text-md mb-3 font-medium text-gray-700">
                  Setup steps:
                </h4>
                <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                  <li>
                    Go to{" "}
                    <a
                      className="text-blue-600 underline hover:text-blue-800"
                      href="https://developer.x.com/en/portal/petition/essential/basic-info"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      https://developer.x.com/en/portal/petition/essential/basic-info
                    </a>
                  </li>
                  <li>
                    Click on <strong>Sign Up For A Free Account</strong>
                  </li>
                  <li>
                    Write something about how you&apos;ll use the app (it can be
                    literally anything)
                  </li>
                  <li>
                    In the sidebar, click on your project (it probably starts
                    with a string of numbers)
                    <ScreenshotButton
                      altText="Click on your project in the sidebar"
                      imagePath="/screenshots/TWITTER.PNG"
                    />
                  </li>
                  <li>
                    At the bottom of the page you&apos;ll see{" "}
                    <strong>User Authentication Settings</strong> - click{" "}
                    <strong>Set Up</strong>
                  </li>
                  <li>
                    Set App Permissions to: <strong>Read and write</strong>
                  </li>
                  <li>
                    Set Type of App to: <strong>Web app</strong>
                  </li>
                  <li>
                    Under App info, set:
                    <ul className="mt-2 ml-6 list-inside list-disc space-y-1">
                      <li>
                        Callback URL:{" "}
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                          https://www.thetoolk.it/authorize
                        </code>
                      </li>
                      <li>
                        Website URL:{" "}
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                          https://www.thetoolk.it
                        </code>
                      </li>
                    </ul>
                  </li>
                  <li>
                    Click <strong>Done</strong> and your Client ID and secret
                    will pop up
                  </li>
                  <li>Save these in a safe place</li>
                  <li className="font-medium text-red-600">
                    NEVER SHARE THESE WITH ANYONE
                  </li>
                </ol>
              </div>

              <div className="mt-6">
                <h4 className="text-md mb-3 font-medium text-gray-700">
                  Connect to TheToolkit:
                </h4>
                <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                  <li>Head to www.thetoolk.it</li>
                  <li>
                    Click on <strong>Twitter</strong>
                  </li>
                  <li>Enter your Client ID and Client Secret</li>
                  <li>
                    Click <strong>Save API Settings</strong>
                  </li>
                  <li>
                    Click <strong>Authorize</strong>
                  </li>
                  <li>Follow the prompts</li>
                  <li className="font-medium text-green-600">
                    You&apos;re done! 🎉
                  </li>
                </ol>
              </div>
            </AccordionSection>

            <AccordionSection
              isOpen={openSections.youtube}
              onToggle={() => toggleSection("youtube")}
              title="YouTube"
            >
              <div className="mb-4">
                <h4 className="text-md mb-2 font-medium text-gray-700">
                  What you need:
                </h4>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• Client ID</li>
                  <li>• Client Secret</li>
                </ul>
              </div>

              <div>
                <h4 className="text-md mb-3 font-medium text-gray-700">
                  Setup steps:
                </h4>
                <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                  <li>
                    In a tab where you&apos;re logged into the YouTube account
                    you want to use, go to:{" "}
                    <a
                      className="text-blue-600 underline hover:text-blue-800"
                      href="https://console.cloud.google.com/projectselector2/apis/credentials"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      https://console.cloud.google.com/projectselector2/apis/credentials
                    </a>
                  </li>
                  <li>
                    Create a project (can name it anything)
                    <ScreenshotButton
                      altText="Create a project"
                      imagePath="/screenshots/YOUTUBE/YOUTUBE1.png"
                    />
                  </li>
                  <li>
                    At the top of the page, click{" "}
                    <strong>+Create Credentials</strong>
                    <ScreenshotButton
                      altText="Click +Create Credentials"
                      imagePath="/screenshots/YOUTUBE/YOUTUBE2.png"
                    />
                  </li>
                  <li>
                    Choose <strong>OAuth client ID</strong>
                  </li>
                  <li>
                    Click <strong>Configure consent screen</strong>
                    <ScreenshotButton
                      altText="Click Configure consent screen"
                      imagePath="/screenshots/YOUTUBE/YOUTUBE3.png"
                    />
                  </li>
                  <li>
                    Click <strong>Get Started</strong>
                  </li>
                  <li>
                    Fill in the consent screen:
                    <ul className="mt-2 ml-6 list-inside list-disc space-y-1">
                      <li>
                        App name: <strong>TheToolkit</strong> (or whatever you
                        want, just no special characters)
                      </li>
                      <li>User support email: Your email</li>
                      <li>
                        Audience: <strong>External</strong>
                      </li>
                      <li>Contact Information: Your email</li>
                    </ul>
                  </li>
                  <li>
                    Click <strong>Create</strong>
                  </li>
                  <li>
                    Click <strong>Create OAuth client</strong>
                    <ScreenshotButton
                      altText="Click Create OAuth client"
                      imagePath="/screenshots/YOUTUBE/YOUTUBE4.png"
                    />
                  </li>
                  <li>
                    Set Application type: <strong>Web application</strong>
                  </li>
                  <li>Set Name to anything (can leave as default)</li>
                  <li>
                    Click <strong>+Add URI</strong> for Authorized JavaScript
                    origins and enter:{" "}
                    <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                      https://www.thetoolk.it
                    </code>
                  </li>
                  <li>
                    Click <strong>+Add URI</strong> for Authorized redirect URIs
                    and enter:{" "}
                    <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                      https://www.thetoolk.it/authorize
                    </code>
                  </li>
                  <li>
                    Click <strong>Create</strong>
                  </li>
                  <li>
                    A popup will appear with your Client ID and secret - copy
                    these and save them in a safe place. Press{" "}
                    <strong>OK</strong> when you&apos;re done to close the
                    popup.
                  </li>
                  <li className="font-medium text-red-600">
                    NEVER SHARE THESE WITH ANYONE
                  </li>
                  <li>
                    Click on <strong>Audience</strong> in the sidebar
                    <ScreenshotButton
                      altText="Click on Audience in the sidebar"
                      imagePath="/screenshots/YOUTUBE/YOUTUBE5.png"
                    />
                  </li>
                  <li>
                    At the bottom <strong>Test Users</strong>, click on{" "}
                    <strong>Add Users</strong> and add the email associated with
                    the YouTube account you&apos;re using
                    <ScreenshotButton
                      altText="Click on Add Users and add the email"
                      imagePath="/screenshots/YOUTUBE/YOUTUBE6.png"
                    />
                  </li>
                  <li>
                    Click in the search bar at the top of the screen and search
                    for <strong>youtube API</strong> and then click on{" "}
                    <strong>YouTube Data API v3</strong>. On the screen that
                    pops up, click to enable it.
                    <ScreenshotButton
                      altText="Search for YouTube Data API v3 and enable it"
                      imagePath="/screenshots/YOUTUBE/YOUTUBE7.png"
                    />
                  </li>
                </ol>
              </div>

              <div className="mt-6">
                <h4 className="text-md mb-3 font-medium text-gray-700">
                  Connect to TheToolkit:
                </h4>
                <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-600">
                  <li>Head to www.thetoolk.it</li>
                  <li>
                    Click on <strong>YouTube</strong>
                  </li>
                  <li>Enter your Client ID and Client Secret</li>
                  <li>
                    Click <strong>Save API Settings</strong>
                  </li>
                  <li>
                    Click <strong>Authorize</strong>
                  </li>
                  <li>Follow the prompts</li>
                  <li className="font-medium text-green-600">
                    You&apos;re done! 🎉
                  </li>
                </ol>
              </div>
            </AccordionSection>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="fixed right-0 bottom-0 left-0 z-40 bg-gray-200 shadow-md">
        <AppFooter />
      </footer>
    </div>
  );
}
