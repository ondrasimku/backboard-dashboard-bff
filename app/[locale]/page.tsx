import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('dashboard');
  const tStats = useTranslations('dashboard.stats');
  const tActivity = useTranslations('dashboard.recentActivity');
  const tActions = useTranslations('dashboard.quickActions');

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('welcome')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {tStats('totalProjects')}
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
                  {tStats('datasets')}
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
                  {tStats('activeUsers')}
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
                  {tStats('apiCalls')}
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
            <h3 className="text-lg font-semibold mb-4">{tActivity('title')}</h3>
            <div className="space-y-4">
              {[
                {
                  title: tActivity('newDatasetUploaded'),
                  description: "customer-data-2024.csv",
                  time: "2 minutes ago",
                },
                {
                  title: tActivity('pipelineCompleted'),
                  description: "Data processing pipeline #142",
                  time: "15 minutes ago",
                },
                {
                  title: tActivity('userInvited'),
                  description: "sarah.johnson@example.com",
                  time: "1 hour ago",
                },
                {
                  title: tActivity('projectCreated'),
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
            <h3 className="text-lg font-semibold mb-4">{tActions('title')}</h3>
            <div className="space-y-2">
              <button className="w-full rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent">
                <p className="text-sm font-medium">{tActions('createProject.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {tActions('createProject.description')}
                </p>
              </button>
              <button className="w-full rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent">
                <p className="text-sm font-medium">{tActions('uploadDataset.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {tActions('uploadDataset.description')}
                </p>
              </button>
              <button className="w-full rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent">
                <p className="text-sm font-medium">{tActions('inviteTeamMember.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {tActions('inviteTeamMember.description')}
                </p>
              </button>
              <button className="w-full rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent">
                <p className="text-sm font-medium">{tActions('viewDocumentation.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {tActions('viewDocumentation.description')}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

