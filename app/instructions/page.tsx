"use client";

import { useState } from "react";
import Image from "next/image";

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

interface ScreenshotButtonProps {
  imagePath: string;
  altText: string;
}

function ScreenshotButton({ imagePath, altText }: ScreenshotButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
        title="View screenshot"
      >
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-w-6xl max-h-[95vh] bg-white rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10"
            >
              ×
            </button>
            <Image
              src={imagePath}
              alt={altText}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}

function AccordionSection({ title, children, isOpen, onToggle }: AccordionSectionProps) {
  return (
    <section className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 p-4 rounded-t-lg border border-gray-300 text-left"
      >
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        <span className="text-2xl text-gray-600 transform transition-transform duration-200" 
              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="border-x border-b border-gray-300 rounded-b-lg bg-white p-6">
          {children}
        </div>
      )}
    </section>
  );
}

export default function InstructionsPage() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    storage: true, // Storage section open by default
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            TheToolkit Self-Hosting Instructions
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Follow these instructions to self-host TheToolkit app and configure all the necessary API keys and credentials.
          </p>

          {/* Overview Section */}
          <section className="mb-8">
            <div className="space-y-4">
              <p className="text-gray-700">
                TheToolkit is a self-hosted social media management tool that allows you to post to multiple platforms simultaneously. 
                This guide will walk you through setting up all the required API keys and services.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-blue-800 font-medium">📋 What You'll Need:</p>
                <ul className="mt-2 space-y-1 text-blue-700">
                  <li>• Developer accounts for each social platform</li>
                  <li>• AWS or Pinata for media storage</li>
                  <li>• Basic computer knowledge (clicking buttons, copying and pasting)</li>
                </ul>
              </div>
            </div>
          </section>

          <AccordionSection 
            title="Storage Services" 
            isOpen={openSections.storage} 
            onToggle={() => toggleSection('storage')}
          >
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Amazon S3</h3>
                <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                  <p className="text-red-800 font-medium">⚠️ Warning:</p>
                  <p className="text-red-700 mt-2">
                    If you need to follow a guide to setup an Amazon S3 account, it's better that you don't use Amazon S3! 
                    Take it from me: It's very confusing and can easily result in huge accidental bills. Just use Pinata if you don't already know how to use Amazon S3.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Pinata</h3>
                <p className="text-gray-700 mb-4">
                  If you want to upload media via TheToolkit, you'll need somewhere for that media to live. Pinata is the best option.
                </p>
                
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">What you need:</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• API Key</li>
                    <li>• API Secret</li>
                    <li>• JWT (secret access token)</li>
                    <li>• Gateway</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Setup steps:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>Go to <a href="https://app.pinata.cloud/auth/signin" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">https://app.pinata.cloud/auth/signin</a></li>
                    <li>Log in or create an account</li>
                    <li>
                       Click on <strong>API Keys</strong>
                       <ScreenshotButton imagePath="/screenshots/PINATA/Pinata1.png" altText="Click on API Keys" />
                     </li>
                    <li>
                       Click on <strong>+New Key</strong>
                       <ScreenshotButton imagePath="/screenshots/PINATA/Pinata2.png" altText="Click on +New Key" />
                     </li>
                    <li>Give your API key a name (anything is fine)</li>
                    <li>Make sure to turn on <strong>Admin</strong></li>
                    <li>Click <strong>Create</strong></li>
                    <li>Copy your API Key, API Secret and JWT to a safe place (you can't see them again after this)</li>
                    <li className="text-red-600 font-medium">NEVER SHARE THESE WITH ANYONE</li>
                    <li>
                       Click on <strong>Gateways</strong>
                       <ScreenshotButton imagePath="/screenshots/PINATA/Pinata5.png" altText="Click on Gateways" />
                     </li>
                    <li>Click on <strong>+Create</strong></li>
                    <li>Give your gateway a name (can be anything)</li>
                    </ol>
                    </div>

                    <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Connect to TheToolkit:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                        <li>Head to thetoolk.it</li>
                     <li>Click on <strong>Pinata</strong></li>
                     <li>Enter your API Key, API Secret, JWT and gateway</li>
                     <li>Click <strong>Save API Settings</strong></li>
                     <li className="text-green-600 font-medium">You're done! 🎉</li>
                   </ol>
                 </div>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection 
            title="Bluesky" 
            isOpen={openSections.bluesky} 
            onToggle={() => toggleSection('bluesky')}
          >
            <div className="space-y-6">
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-700 mb-2">What you need:</h4>
                <ul className="space-y-1 text-gray-600 ml-4">
                  <li>• Service URL (most likely https://bsky.social/ unless you know what you're doing)</li>
                  <li>• Username</li>
                  <li>• Password</li>
                </ul>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Setup steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                  <li>Head to thetoolk.it</li>
                  <li>Click on <strong>Bluesky</strong></li>
                  <li>Enter your Service URL, username and password</li>
                  <li>Click <strong>Save API Settings</strong></li>
                  <li>Click <strong>Authorize</strong></li>
                  <li>Follow the prompts</li>
                  <li className="text-green-600 font-medium">You're done! 🎉</li>
                </ol>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection 
            title="Farcaster" 
            isOpen={openSections.farcaster} 
            onToggle={() => toggleSection('farcaster')}
          >
            <p className="text-gray-700 mb-4">
              We'll use Neynar for this. They're free at first, then about a dollar a year.
            </p>
            
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">What you need:</h4>
              <ul className="space-y-1 text-gray-600 ml-4">
                <li>• Client ID</li>
                <li>• API Key</li>
              </ul>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Setup steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>Go to <a href="https://neynar.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">neynar.com</a></li>
                <li>Log in or create an account</li>
                <li>Click on the <strong>Connect Farcaster</strong> button and follow the prompts</li>
                <li>Click on <strong>Apps</strong> in the sidebar</li>
                <li>Copy the Client ID and save it somewhere safe</li>
                <li>Copy the API Key and save it somewhere safe</li>
                </ol>
                </div>

                <div className="mt-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Connect to TheToolkit:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>Head to thetoolk.it</li>
                  <li>Click on <strong>Farcaster</strong></li>
                    <li>Enter your Client ID and API Key</li>
                 <li>Click <strong>Save API Settings</strong></li>
                 <li>Click <strong>Authorize</strong></li>
                 <li>Follow the prompts</li>
                 <li className="text-green-600 font-medium">You're done! 🎉</li>
               </ol>
             </div>
          </AccordionSection>

          <AccordionSection 
            title="Instagram, Threads and Facebook" 
            isOpen={openSections.metaPlatforms} 
            onToggle={() => toggleSection('metaPlatforms')}
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
              <p className="text-yellow-800 font-medium">⚠️ Complex Setup:</p>
              <p className="text-yellow-700 mt-2">
                This setup is more complex. You'll need to create "apps" in the Meta Developer Platform:
              </p>
              <ul className="mt-2 space-y-1 text-yellow-700 ml-4">
                <li>• One app for Threads & Facebook</li>
                <li>• A separate app for Instagram</li>
              </ul>
              <p className="text-yellow-700 mt-2">
                None of this makes any sense. I'm sorry! They don't make it easy for non-technical people. But you can definitely do it.
              </p>
            </div>

            <div className="space-y-8">
              {/* Meta Developer Account Setup */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Meta Developer Account Setup</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                  <li>Log in to Facebook</li>
                  <li>If you haven't signed up for a Meta Developer account yet, do that here: <a href="https://developers.facebook.com/async/registration" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">https://developers.facebook.com/async/registration</a></li>
                </ol>
              </div>

              {/* Instagram */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Instagram</h3>
                
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">What you need:</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• App ID</li>
                    <li>• App Secret</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Create the Instagram app:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">developers.facebook.com</a></li>
                    <li>
                      Click on <strong>My Apps</strong>
                      <ScreenshotButton imagePath="/screenshots/INSTAGRAM/Instagram1.png" altText="Click on My Apps" />
                    </li>
                    <li>Click on <strong>Create App</strong></li>
                    <li>Give your app a name (can be anything)</li>
                    <li>Click through the dialog (may or may not show up)</li>
                    <li>
                      Choose <strong>Other</strong> at the bottom of the list, then click <strong>Next</strong>
                      <ScreenshotButton imagePath="/screenshots/INSTAGRAM/Instagram5.png" altText="Choose Other at the bottom of the list" />
                    </li>
                    <li>Choose <strong>Business</strong></li>
                    <li>Click <strong>Create App</strong></li>
                    <li>Click <strong>Set up</strong> in the Instagram tile</li>
                    <li>
                      Copy and save the Instagram app ID and Instagram app secret
                      <ScreenshotButton imagePath="/screenshots/INSTAGRAM/Instagram6.png" altText="Copy and save the Instagram app ID and Instagram app secret" />
                    </li>
                  </ol>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Configure Instagram testers:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>
                      Click on <strong>App roles</strong>, then <strong>Roles</strong>
                      <ScreenshotButton imagePath="/screenshots/INSTAGRAM/Instagram7.png" altText="Click on App roles, then Roles" />
                    </li>
                    <li>Click on <strong>Add People</strong></li>
                    <li>Choose <strong>Instagram Tester</strong>, then type your Instagram name into the box and hit Enter when you find it</li>
                    <li>
                      Click on the <strong>Apps and Websites</strong> link and sign in when prompted
                      <ScreenshotButton imagePath="/screenshots/INSTAGRAM/Instagram8.png" altText="Click on Apps and Websites link" />
                    </li>
                    <li>Log in to the Instagram account you'll want to be posting with</li>
                    <li>
                      Click on <strong>Tester Invites</strong>, then choose <strong>Accept</strong> and close that tab
                      <ScreenshotButton imagePath="/screenshots/INSTAGRAM/Instagram9.png" altText="Click on Tester Invites, then choose Accept" />
                    </li>
                    <li>Click back to the developer page and refresh the page to make sure it worked (the "pending" should disappear)</li>
                  </ol>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Configure app settings:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>
                      Click on <strong>App settings</strong>, then <strong>Basic</strong>
                      <ScreenshotButton imagePath="/screenshots/INSTAGRAM/Instagram10.png" altText="Click on App settings, then Basic" />
                      <ul className="list-disc list-inside mt-2 ml-6 space-y-1">
                        <li>Set App domains to: <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://thetoolk.it</code></li>
                        <li>
                          Switch User data deletion to <strong>Data deletion callback URL</strong>, then set it to: <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://thetoolk.it/data-delete</code>
                          <ScreenshotButton imagePath="/screenshots/INSTAGRAM/Instagram12.png" altText="Switch User data deletion to Data deletion callback URL" />
                        </li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Connect to TheToolkit:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>Head to thetoolk.it</li>
                    <li>Click on <strong>Instagram</strong></li>
                    <li>Enter your App ID and App Secret</li>
                    <li>Click <strong>Save API Settings</strong></li>
                    <li>Click <strong>Authorize</strong></li>
                    <li>Follow the prompts</li>
                    <li className="text-green-600 font-medium">You're done 🎉</li>
                  </ol>
                </div>
              </div>

              {/* Threads */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Threads</h3>
                
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">What you need:</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• App ID</li>
                    <li>• App Secret</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Create the Threads/Facebook app:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">developers.facebook.com</a></li>
                    <li>
                      Click on <strong>My Apps</strong>
                      <ScreenshotButton imagePath="/screenshots/FACEBOOK/Facebook1.png" altText="Click on My Apps" />
                    </li>
                    <li>Click on <strong>Create App</strong></li>
                    <li>Give your app a name (can be anything)</li>
                    <li>Click through the dialog (may or may not show up)</li>
                    <li>
                      Under Use Cases, choose <strong>Access the Threads API</strong> and <strong>Manage everything on your Page</strong>
                      <ScreenshotButton imagePath="/screenshots/FACEBOOK/Facebook5.png" altText="Choose Access the Threads API and Manage everything on your Page" />
                    </li>
                    <li>Click <strong>Next</strong></li>
                    <li>If you have a business portfolio, select it (if you want). If you don't, just click <strong>Next</strong></li>
                    <li>Click <strong>Next</strong>, then <strong>Next</strong> again, then <strong>Go to dashboard</strong></li>
                    <li>Click through the popup (if it shows up)</li>
                  </ol>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Configure Threads:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>On <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">developers.facebook.com</a>, click on <strong> My Apps</strong></li>
                    <li>Click on your app</li>
                    <li>Click on <strong>Customize the Access the Threads API use case</strong></li>
                    <li>
                      Make sure <strong>threads_basic</strong> and <strong>threads_content_publish</strong> are added
                      <ScreenshotButton imagePath="/screenshots/THREADS/Threads4.png" altText="Make sure threads_basic and threads_content_publish are added" />
                    </li>
                    <li>
                      Click on <strong>Settings</strong>
                      <ScreenshotButton imagePath="/screenshots/THREADS/Threads5.png" altText="Click on Settings" />
                    </li>
                    <li>
                      Copy the Threads app ID and Threads app secret and save them somewhere safe
                      <ScreenshotButton imagePath="/screenshots/THREADS/Threads6.png" altText="Copy the Threads app ID and Threads app secret" />
                    </li>
                    <li>Set Redirect Callback URLs to: <code className="bg-gray-100 px-2 py-1 rounded text-sm">http://thetoolk.it/authorize</code> (make sure to hit Enter)</li>
                    <li>Set Uninstall Callback URL to: <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://thetoolk.it/deauthorize</code></li>
                    <li>Set Delete Callback URL to: <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://thetoolk.it/delete-data</code></li>
                    <li>Click <strong>Save</strong></li>
                    <li>
                      Click <strong>App roles</strong> and then <strong>Roles</strong>
                      <ScreenshotButton imagePath="/screenshots/THREADS/Threads7.png" altText="Click App roles and then Roles" />
                    </li>
                    <li>Click <strong>Add People</strong></li>
                    <li>
                       Choose <strong>Threads Tester</strong>, then search for your Threads profile and hit Enter when you find it
                       <ScreenshotButton imagePath="/screenshots/THREADS/Threads8.png" altText="Choose Threads Tester and search for your profile" />
                     </li>
                    <li>Click <strong>Add</strong></li>
                    <li>
                       Click on the link to <strong>Website Permissions</strong>
                       <ScreenshotButton imagePath="/screenshots/THREADS/Threads9.png" altText="Click on the link to Website Permissions" />
                     </li>
                    <li>Log in to the Threads account you'll want to post from</li>
                    <li>
                    Click on <strong>Invites</strong> and accept the invite
                    <ScreenshotButton imagePath="/screenshots/THREADS/Threads10.png" altText="Click on Invites and accept the invite" />
                    </li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Connect to TheToolkit:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>Head to thetoolk.it</li>
                    <li>Click on <strong>Threads</strong></li>
                    <li>Enter your Threads app ID and Threads app secret</li>
                    <li>Click <strong>Save API Settings</strong></li>
                    <li>Click <strong>Authorize</strong></li>
                    <li>Follow the prompts</li>
                    <li className="text-green-600 font-medium">You're done with Threads! 🎉</li>
                  </ol>
                </div>
              </div>

              {/* Facebook */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Facebook</h3>
                
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">What you need:</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• App ID</li>
                    <li>• App Secret</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Configure Facebook (using the same app you created for Threads):</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>
                       On <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">developers.facebook.com</a>, click on <strong>My Apps</strong>
                       <ScreenshotButton imagePath="/screenshots/FACEBOOK-PAGES/FBPAGES1.png" altText="Click on My Apps on developers.facebook.com" />
                     </li>
                    <li>Click on your app</li>
                    <li>
                       Click on <strong>Customize the Manage everything on your Page use case</strong>
                       <ScreenshotButton imagePath="/screenshots/FACEBOOK-PAGES/FBPAGES3.png" altText="Click on Customize the Manage everything on your Page use case" />
                     </li>
                    <li>
                       Add <strong>pages_manage_posts</strong>, <strong>pages_read_engagement</strong> and <strong>pages_show_list</strong>
                       <ScreenshotButton imagePath="/screenshots/FACEBOOK-PAGES/FBPAGES4.png" altText="Add pages_manage_posts, pages_read_engagement and pages_show_list" />
                     </li>
                    <li>Click the <strong>Home</strong> icon to go back to your dashboard</li>
                    <li>
                       Click on <strong>App settings</strong>, then <strong>Basic</strong>
                       <ScreenshotButton imagePath="/screenshots/FACEBOOK-PAGES/FBPAGES5.png" altText="Click on App settings, then Basic" />
                     </li>
                    <li>Copy and save the App ID and App Secret from the top of the page
                      <ul className="list-disc list-inside mt-2 ml-6 space-y-1">
                        <li>
                           Set App domains to: <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://thetoolk.it</code>
                           <ScreenshotButton imagePath="/screenshots/FACEBOOK-PAGES/FBPAGES6.png" altText="Set App domains to thetoolk.it" />
                         </li>
                         <li>Switch User data deletion to <strong>Data deletion callback URL</strong>, then set it to: <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://thetoolk.it/data-delete</code></li>
                       </ul>
                     </li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Connect to TheToolkit:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>Head to thetoolk.it</li>
                    <li>Click on <strong>Facebook</strong></li>
                    <li>Enter your App ID and App Secret</li>
                    <li>Click <strong>Save API Settings</strong></li>
                    <li>Click <strong>Authorize</strong></li>
                    <li>Follow the prompts</li>
                    <li className="text-green-600 font-medium">You're done with Facebook! 🎉</li>
                  </ol>
                </div>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection 
            title="Twitter/X" 
            isOpen={openSections.twitter} 
            onToggle={() => toggleSection('twitter')}
          >
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">What you need:</h4>
              <ul className="space-y-1 text-gray-600 ml-4">
                <li>• OAuth 2.0 Client ID</li>
                <li>• OAuth 2.0 Client Secret</li>
              </ul>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Setup steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>Go to <a href="https://developer.x.com/en/portal/petition/essential/basic-info" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">https://developer.x.com/en/portal/petition/essential/basic-info</a></li>
                <li>Click on <strong>Sign Up For A Free Account</strong></li>
                <li>Write something about how you'll use the app (it can be literally anything)</li>
                <li>
                   In the sidebar, click on your project (it probably starts with a string of numbers)
                   <ScreenshotButton imagePath="/screenshots/TWITTER.PNG" altText="Click on your project in the sidebar" />
                 </li>
                <li>At the bottom of the page you'll see <strong>User Authentication Settings</strong> - click <strong>Set Up</strong></li>
                <li>Set App Permissions to: <strong>Read and write</strong></li>
                <li>Set Type of App to: <strong>Web app</strong></li>
                <li>Under App info, set:
                  <ul className="list-disc list-inside mt-2 ml-6 space-y-1">
                    <li>Callback URL: <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://thetoolk.it/authorize</code></li>
                    <li>Website URL: <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://thetoolk.it</code></li>
                  </ul>
                </li>
                <li>Click <strong>Done</strong> and your Client ID and secret will pop up</li>
                <li>Save these in a safe place</li>
                </ol>
                </div>

                <div className="mt-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Connect to TheToolkit:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>Head to thetoolk.it</li>
                  <li>Click on <strong>Twitter</strong></li>
                    <li>Enter your Client ID and Client Secret</li>
                 <li>Click <strong>Save API Settings</strong></li>
                 <li>Click <strong>Authorize</strong></li>
                 <li>Follow the prompts</li>
                 <li className="text-green-600 font-medium">You're done! 🎉</li>
               </ol>
             </div>
          </AccordionSection>

          <AccordionSection 
            title="YouTube" 
            isOpen={openSections.youtube} 
            onToggle={() => toggleSection('youtube')}
          >
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">What you need:</h4>
              <ul className="space-y-1 text-gray-600 ml-4">
                <li>• Client ID</li>
                <li>• Client Secret</li>
              </ul>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Setup steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>In a tab where you're logged into the YouTube account you want to use, go to: <a href="https://console.cloud.google.com/projectselector2/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">https://console.cloud.google.com/projectselector2/apis/credentials</a></li>
                <li>
                   Create a project (can name it anything)
                   <ScreenshotButton imagePath="/screenshots/YOUTUBE/YOUTUBE1.png" altText="Create a project" />
                 </li>
                <li>
                   At the top of the page, click <strong>+Create Credentials</strong>
                   <ScreenshotButton imagePath="/screenshots/YOUTUBE/YOUTUBE2.png" altText="Click +Create Credentials" />
                 </li>
                <li>Choose <strong>OAuth client ID</strong></li>
                <li>
                   Click <strong>Configure consent screen</strong>
                   <ScreenshotButton imagePath="/screenshots/YOUTUBE/YOUTUBE3.png" altText="Click Configure consent screen" />
                 </li>
                <li>Click <strong>Get Started</strong></li>
                <li>Fill in the consent screen:
                  <ul className="list-disc list-inside mt-2 ml-6 space-y-1">
                    <li>App name: <strong>TheToolkit</strong> (or whatever you want, just no special characters)</li>
                    <li>User support email: Your email</li>
                    <li>Audience: <strong>External</strong></li>
                    <li>Contact Information: Your email</li>
                  </ul>
                </li>
                <li>Click <strong>Create</strong></li>
                <li>
                   Click <strong>Create OAuth client</strong>
                   <ScreenshotButton imagePath="/screenshots/YOUTUBE/YOUTUBE4.png" altText="Click Create OAuth client" />
                 </li>
                <li>Set Application type: <strong>Web application</strong></li>
                <li>Set Name to anything (can leave as default)</li>
                <li>Click <strong>+Add URI</strong> for Authorized JavaScript origins and enter: <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://thetoolk.it</code></li>
                <li>Click <strong>+Add URI</strong> for Authorized redirect URIs and enter: <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://thetoolk.it/authorize</code></li>
                <li>Click <strong>Create</strong></li>
                <li>A popup will appear with your Client ID and secret - copy these and save them in a safe place. Press <strong>OK</strong> when you're done to close the popup.</li>
                <li>
                   Click on <strong>Audience</strong> in the sidebar
                   <ScreenshotButton imagePath="/screenshots/YOUTUBE/YOUTUBE5.png" altText="Click on Audience in the sidebar" />
                 </li>
                <li>
                At the bottom <strong>Test Users</strong>, click on <strong>Add Users</strong> and add the email associated with the YouTube account you're using
                <ScreenshotButton imagePath="/screenshots/YOUTUBE/YOUTUBE6.png" altText="Click on Add Users and add the email" />
                </li>
                </ol>
                </div>

                <div className="mt-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Connect to TheToolkit:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>Head to thetoolk.it</li>
                  <li>Click on <strong>YouTube</strong></li>
                    <li>Enter your Client ID and Client Secret</li>
                 <li>Click <strong>Save API Settings</strong></li>
                 <li>Click <strong>Authorize</strong></li>
                 <li>Follow the prompts</li>
                 <li className="text-green-600 font-medium">You're done! 🎉</li>
               </ol>
             </div>
          </AccordionSection>
        </div>
      </div>
    </div>
  );
}
