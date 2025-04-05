import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { Leaf, MapPin, Cloud, Wind, Droplets, ThermometerSun, AlertTriangle, TreePine } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-slate-950">
      <div className="container mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">EnviroVision</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="font-medium text-green-700 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
            >
              Home
            </Link>
            <Link
              href="/map"
              className="font-medium text-slate-600 hover:text-green-700 dark:text-slate-300 dark:hover:text-green-400"
            >
              Explore Map
            </Link>
            <ModeToggle />
          </nav>
        </header>

        <main>
          <section className="py-12 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-green-800 dark:text-green-300">
                      Environmental Insights at Your Fingertips
                    </h1>
                    <p className="max-w-[600px] text-slate-700 dark:text-slate-300 md:text-xl">
                      Discover weather patterns, environmental data, and AI-powered insights for any location on Earth.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Link href="/map">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Explore Map
                        <MapPin className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <img
                    alt="Environmental data visualization"
                    className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                    height="310"
                    src="/placeholder.svg?height=310&width=550"
                    width="550"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="py-12 bg-white/50 dark:bg-slate-900/50 rounded-xl">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-green-700 dark:text-green-400">
                    Comprehensive Environmental Analysis
                  </h2>
                  <p className="max-w-[900px] text-slate-700 dark:text-slate-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our platform combines real-time weather data with advanced AI analysis to provide you with
                    actionable environmental insights.
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-white/80 dark:bg-slate-800/80 border-green-100 dark:border-green-900">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Cloud className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <CardTitle className="text-xl text-green-700 dark:text-green-400">Weather Forecasts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-700 dark:text-slate-300">
                      Get accurate 7-day weather forecasts for any location with detailed temperature, precipitation,
                      and wind data.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-800/80 border-green-100 dark:border-green-900">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Wind className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <CardTitle className="text-xl text-green-700 dark:text-green-400">Air Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-700 dark:text-slate-300">
                      Monitor air quality indices including PM2.5, PM10, ozone levels, and other pollutants that affect
                      health.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-800/80 border-green-100 dark:border-green-900">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <AlertTriangle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <CardTitle className="text-xl text-green-700 dark:text-green-400">Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-700 dark:text-slate-300">
                      AI-powered analysis of potential environmental risks including floods, wildfires, and other
                      natural hazards.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-800/80 border-green-100 dark:border-green-900">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <ThermometerSun className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <CardTitle className="text-xl text-green-700 dark:text-green-400">Climate Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-700 dark:text-slate-300">
                      Understand long-term climate patterns and how they compare to historical data for your selected
                      location.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-800/80 border-green-100 dark:border-green-900">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Droplets className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <CardTitle className="text-xl text-green-700 dark:text-green-400">Water Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-700 dark:text-slate-300">
                      Access data on water quality, availability, and potential issues affecting local water resources.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-800/80 border-green-100 dark:border-green-900">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <TreePine className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <CardTitle className="text-xl text-green-700 dark:text-green-400">Sustainability Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-700 dark:text-slate-300">
                      Receive personalized recommendations for improving environmental sustainability in your specific
                      location.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="py-12">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-green-700 dark:text-green-400">
                    How It Works
                  </h2>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Select Location</h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    Use our interactive map to select any location around the world.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Cloud className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Gather Data</h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    Our system collects comprehensive weather and environmental data for your chosen location.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <AlertTriangle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-400">AI Analysis</h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    Advanced AI analyzes the data to provide insights, forecasts, and recommendations.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="py-6 border-t border-green-200 dark:border-green-900">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
              <p className="text-sm text-slate-600 dark:text-slate-400">© 2025 EnviroVision. All rights reserved.</p>
            </div>
            <nav className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
              <Link href="#" className="hover:underline">
                Terms
              </Link>
              <Link href="#" className="hover:underline">
                Privacy
              </Link>
              <Link href="#" className="hover:underline">
                Contact
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  )
}

