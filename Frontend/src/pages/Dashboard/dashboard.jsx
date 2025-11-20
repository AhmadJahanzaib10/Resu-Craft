import React, { useEffect, useState } from "react";
// import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import Dash from "@/components/DashboardSections/Dash";
import ResumeBuilder from "@/components/DashboardSections/ResumeBuilder";
import CoverLetter from "@/components/DashboardSections/CoverLetter";
import CreateResume from "@/components/DashboardSections/CreateResume";
import { Minus, Bell, Search } from "lucide-react";
import Settings from "@/components/DashboardSections/Settings";
import Plan from "@/components/DashboardSections/Plan"
import CreateCover from "@/components/DashboardSections/CreateCover";
import { auth } from "@/Firebase/firebase.config";

function DashContent({onSectionChange}) {
  return (
    <div>
      <Dash onSectionChange={onSectionChange} />
    </div>
  )
}

function ResumeBuilderContent({ setActiveSection }) { 
  return (
   <div>
      <ResumeBuilder setActiveSection={setActiveSection} />
   </div>
  );
}


function CreateResumeContent() {
  return (
    <div>
      <CreateResume />
    </div>
  )
}

function CoverBuilderContent({ setActiveSection }) {
  return (
    <div>
      <CoverLetter setActiveSection={setActiveSection} />
    </div>
  );
}

function SettingsContent() {
  return (
    <div>
      <Settings />
    </div>
  )
}
function PlanContent() {
  return (
    <div>
      <Plan />
    </div>
  )
}

function CreateCoverContent() {
  return (
    <div>
      <CreateCover />
    </div>
  )
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        if (!currentUser.emailVerified) {
          // ❗ Redirect unverified users out
          navigate("/verify-email");
          return;
        }
        setUser({
          name: currentUser.displayName || "User",
          email: currentUser.email,
          avatar: currentUser.photoURL || "/avatars/default.jpg",
        });
      } else {
        setUser(null);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const logout = () => {
    auth.signOut();
    navigate("/");
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Conditionally render the main content based on the activeSection.
  let mainContent;
  switch (activeSection) {
    case "Dashboard":
      mainContent = <DashContent onSectionChange={handleSectionChange}/>;
      break;
    case "Resume Builder":
      mainContent = <ResumeBuilderContent setActiveSection={handleSectionChange} />;
      break;
    case "My Resumes":
      mainContent = <ResumeBuilderContent setActiveSection={handleSectionChange} />;
      break;
    case "Create New":
      mainContent = <CreateResumeContent />;
      break;
    case "Templates":
      mainContent = <ResumeBuilderContent setActiveSection={handleSectionChange} />;
      break;
    case "Cover Letters":
      mainContent = <CoverBuilderContent setActiveSection={handleSectionChange} />;
      break;
    case "My Letters":
      mainContent = <CoverBuilderContent setActiveSection={handleSectionChange} />;
      break;
    case "Create New Cover":
      mainContent = <CreateCover></CreateCover>;
      break;
    case "Recent":
      mainContent = <CoverBuilderContent setActiveSection={handleSectionChange} />;
      break;
    case "Profile":
      mainContent = <SettingsContent />;
      break;
    case "Settings":
      mainContent = <SettingsContent />;
      break;
    case "Plans":
      mainContent = <PlanContent />;
      break;
    default:
      mainContent = <DashContent />;
  }

  let parentItem;
  let subItem;

  // Determine parent and sub items based on active section
  if (["My Resumes", "Create New", "Templates"].includes(activeSection)) {
    parentItem = "Resume Builder";
    subItem = activeSection;
  } else if (["My Letters", "Create New", "Recent"].includes(activeSection)) {
    parentItem = "Cover Letters";
    subItem = activeSection;
  } else {
    parentItem = activeSection;
    subItem = null;
  }

  return (
    <SidebarProvider>
      <AppSidebar onSectionChange={handleSectionChange} activeSection={activeSection} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 bg-white/80 backdrop-blur-lg border-b border-gray-100/50">
          <div className="flex items-center gap-4 px-4">
            <SidebarTrigger className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors" />
            <div className="flex items-center gap-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink 
                      className="text-gray-900 font-medium hover:text-primary transition-colors"
                      onClick={() => handleSectionChange(parentItem)}
                    >
                      {parentItem}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {subItem && (
                    <>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-gray-600 font-medium">
                          {subItem}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-64 rounded-lg border border-gray-100/50 bg-gray-50/50 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all"
              />
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
            {user && <NavUser user={user} onLogout={logout} />}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {mainContent}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
