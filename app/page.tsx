import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your Backboard control center
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Projects
                </p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Datasets
                </p>
                <p className="text-2xl font-bold">48</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-6 w-6 text-primary"
                >
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                  <path d="M3 12A9 3 0 0 0 21 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Users
                </p>
                <p className="text-2xl font-bold">142</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  API Calls
                </p>
                <p className="text-2xl font-bold">8.4K</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-6 w-6 text-primary"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                {
                  title: "New dataset uploaded",
                  description: "customer-data-2024.csv",
                  time: "2 minutes ago",
                },
                {
                  title: "Pipeline completed",
                  description: "Data processing pipeline #142",
                  time: "15 minutes ago",
                },
                {
                  title: "User invited",
                  description: "sarah.johnson@example.com",
                  time: "1 hour ago",
                },
                {
                  title: "Project created",
                  description: "Q4 Analytics Dashboard",
                  time: "3 hours ago",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-3 rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent">
                <p className="text-sm font-medium">Create New Project</p>
                <p className="text-xs text-muted-foreground">
                  Start a new project from scratch
                </p>
              </button>
              <button className="w-full rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent">
                <p className="text-sm font-medium">Upload Dataset</p>
                <p className="text-xs text-muted-foreground">
                  Import data for analysis
                </p>
              </button>
              <button className="w-full rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent">
                <p className="text-sm font-medium">Invite Team Member</p>
                <p className="text-xs text-muted-foreground">
                  Add someone to your organization
                </p>
              </button>
              <button className="w-full rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent">
                <p className="text-sm font-medium">View Documentation</p>
                <p className="text-xs text-muted-foreground">
                  Learn how to use the platform
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
