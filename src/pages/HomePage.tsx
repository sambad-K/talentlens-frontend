import { useEffect, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ChevronLeft, ChevronRight, FileCheck2, SearchCheck, Sparkles, Users } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { useAuth } from '../context/auth-context'

const featureSlides = [
  {
    title: 'Find opportunities that fit you',
    description: 'Browse clear, role-based vacancy listings and quickly spot the jobs that match your experience and interests.',
    detail: 'Smart listings with role details, skills, and experience expectations.',
    icon: SearchCheck,
    accent: 'from-emerald-500/15 to-emerald-500/5',
  },
  {
    title: 'Apply without the friction',
    description: 'Submit your CV and details in a simple flow designed to keep the process fast and easy for job seekers.',
    detail: 'One clean application flow, no unnecessary steps or confusion.',
    icon: FileCheck2,
    accent: 'from-sky-500/15 to-sky-500/5',
  },
  {
    title: 'Track your application journey',
    description: 'Stay informed as your application moves through review, shortlist, and outcome stages.',
    detail: 'Know where you stand at every step from application to decision.',
    icon: Users,
    accent: 'from-violet-500/15 to-violet-500/5',
  },
  {
    title: 'Get a clear outcome',
    description: 'See when your profile is shortlisted or rejected and keep moving confidently toward the next opportunity.',
    detail: 'Simple status updates that help you act quickly and clearly.',
    icon: CheckCircle2,
    accent: 'from-amber-500/15 to-amber-500/5',
  },
]

export function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const auth = useAuth()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featureSlides.length)
    }, 2000)

    return () => window.clearInterval(timer)
  }, [])

  const activeSlide = featureSlides[activeIndex]
  const isLoggedIn = auth.isAuthenticated

  return (
    <div className="space-y-14 pb-8">
      <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">What users get</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">A hiring experience built around you</h2>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveIndex((current) => (current - 1 + featureSlides.length) % featureSlides.length)}
              aria-label="Previous feature"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveIndex((current) => (current + 1) % featureSlides.length)}
              aria-label="Next feature"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className={`rounded-[24px] border border-border bg-gradient-to-br ${activeSlide.accent} p-6`}>
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-background/80 text-primary shadow-sm">
              <activeSlide.icon className="h-5 w-5" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex rounded-full border border-border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                User experience
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{activeSlide.title}</h3>
              <p className="max-w-xl text-base text-muted-foreground">{activeSlide.description}</p>
              <p className="text-sm font-medium text-foreground/90">{activeSlide.detail}</p>
            </div>
          </div>

          <div className="space-y-3">
            {featureSlides.map((slide, index) => {
              const Icon = slide.icon
              const isActive = index === activeIndex

              return (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-secondary/40 hover:border-border/90 hover:bg-secondary/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${isActive ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{slide.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{slide.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 sm:hidden">
          <Button variant="outline" size="icon" onClick={() => setActiveIndex((current) => (current - 1 + featureSlides.length) % featureSlides.length)} aria-label="Previous feature">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setActiveIndex((current) => (current + 1) % featureSlides.length)} aria-label="Next feature">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-gradient-to-br from-primary/10 via-card to-sky-500/5 p-6 shadow-sm sm:p-8 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Built for modern hiring
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Discover roles that move your career forward.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                TalentLens makes it easy to explore vacancies, apply with confidence, and stay informed through every stage of the recruitment journey.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/vacancies" className="inline-flex items-center gap-2">
                  Explore vacancies
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {!isLoggedIn ? (
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Join now</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="lg">
                  <Link to="/account">Go to dashboard</Link>
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
                <span>Live roles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <span>Simple applications</span>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-card/90 p-5 shadow-lg shadow-foreground/5 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/70 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Open opportunities</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">24</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Application progress</p>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">On track</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Profile review</span>
                      <span className="font-medium text-foreground">82%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-border">
                      <div className="h-2.5 w-[82%] rounded-full bg-primary" />
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Shortlisted</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">27</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Rejected</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">39</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-dashed border-primary/40 bg-primary/5 p-8 text-center shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">What users get</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">A hiring experience built around you</h2>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveIndex((current) => (current - 1 + featureSlides.length) % featureSlides.length)}
              aria-label="Previous feature"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveIndex((current) => (current + 1) % featureSlides.length)}
              aria-label="Next feature"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className={`rounded-[24px] border border-border bg-gradient-to-br ${activeSlide.accent} p-6`}>
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-background/80 text-primary shadow-sm">
              <activeSlide.icon className="h-5 w-5" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex rounded-full border border-border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                User experience
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{activeSlide.title}</h3>
              <p className="max-w-xl text-base text-muted-foreground">{activeSlide.description}</p>
              <p className="text-sm font-medium text-foreground/90">{activeSlide.detail}</p>
            </div>
          </div>

          <div className="space-y-3">
            {featureSlides.map((slide, index) => {
              const Icon = slide.icon
              const isActive = index === activeIndex

              return (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-secondary/40 hover:border-border/90 hover:bg-secondary/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${isActive ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{slide.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{slide.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 sm:hidden">
          <Button variant="outline" size="icon" onClick={() => setActiveIndex((current) => (current - 1 + featureSlides.length) % featureSlides.length)} aria-label="Previous feature">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setActiveIndex((current) => (current + 1) % featureSlides.length)} aria-label="Next feature">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="rounded-[28px] border border-dashed border-primary/40 bg-primary/5 p-8 text-center shadow-sm">
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground">Ready to move your next opportunity forward?</h2>
        <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
          Explore roles, apply in minutes, and keep track of your hiring journey in a platform built for clarity and speed.
        </p>
        <Button asChild size="lg">
          <Link to="/vacancies" className="inline-flex items-center gap-2">
            Browse roles <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
