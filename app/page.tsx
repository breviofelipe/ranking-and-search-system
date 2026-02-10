import { PageHeader } from "@/components/page-header"
import { RankingList } from "@/components/ranking-list"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RankingList />
      </main>
    </div>
  )
}
