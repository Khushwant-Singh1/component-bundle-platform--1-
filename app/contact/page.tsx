import Link from "next/link"
import { Mail, MessageSquare, Clock, Phone, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            BundleHub
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/bundles" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Bundles
            </Link>
            <Link href="/contact" className="text-foreground font-semibold">
              Contact
            </Link>
            <Button size="sm" asChild>
              <Link href="/bundles">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold">Get in Touch</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Have questions about our bundles? Need help with setup? Our expert team is here to help you succeed.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Methods */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">How Can We Help?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Choose the best way to reach us based on your needs. We&apos;re committed to providing excellent support.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Email Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Get help with technical questions, billing, or general inquiries.
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href="mailto:support@bundlehub.com">
                          <Mail className="mr-2 h-4 w-4" />
                          support@bundlehub.com
                        </a>
                      </Button>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Response within 24 hours
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      Live Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Get instant help during business hours for urgent questions.
                    </p>
                    <Button className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Start Live Chat
                    </Button>
                    <div className="text-xs text-muted-foreground">Available Mon-Fri, 9 AM - 6 PM EST</div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      Phone Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Premium customers can schedule a call with our technical team.
                    </p>
                    <Button variant="outline" className="w-full">
                      <Phone className="mr-2 h-4 w-4" />
                      Schedule a Call
                    </Button>
                    <div className="text-xs text-muted-foreground">Available for Enterprise customers</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Our Location</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        San Francisco, CA
                        <br />
                        Remote-first team serving globally
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" placeholder="John" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" placeholder="Doe" required />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" placeholder="john@example.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" placeholder="Your Company" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="What's this about?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="presales">Pre-sales Inquiry</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us how we can help you..."
                        className="min-h-[150px]"
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <Button type="submit" size="lg" className="w-full">
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        By submitting this form, you agree to our{" "}
                        <Link href="/privacy" className="underline">
                          Privacy Policy
                        </Link>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Quick answers to common questions. Can&apos;t find what you&apos;re looking for? Contact us directly.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How quickly do you respond?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We typically respond to emails within 24 hours during business days. Live chat provides instant
                      responses during business hours.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Do you offer phone support?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Phone support is available for Enterprise customers and complex technical issues. You can schedule
                      a call through our support portal.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What about refunds?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We offer a 30-day money-back guarantee on all bundles. Contact us if you&apos;re not satisfied for any
                      reason.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can you help with customization?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes! We provide guidance on customization and can offer paid consulting for complex modifications
                      or integrations.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="mt-16 text-center space-y-8">
            <h3 className="text-2xl font-bold">Other Ways to Get Help</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive guides and tutorials for all our bundles.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/docs">View Docs</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Community</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join our Discord community to connect with other developers.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://discord.gg/bundlehub" target="_blank" rel="noopener noreferrer">
                      Join Discord
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Video Tutorials</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Step-by-step video guides for setup and customization.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://youtube.com/@bundlehub" target="_blank" rel="noopener noreferrer">
                      Watch Videos
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
