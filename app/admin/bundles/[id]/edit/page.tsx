"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, X, Plus, Save, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Mock data - in real app this would come from API
const mockBundleData = {
  id: 1,
  name: "Dashboard Pro",
  slug: "dashboard-pro",
  shortDescription: "Complete admin dashboard solution with analytics and user management",
  description:
    "Dashboard Pro is a comprehensive admin dashboard solution built with Next.js 14, TypeScript, and Tailwind CSS. It includes everything you need to build a modern, responsive admin interface with real-time analytics, user management, and beautiful data visualizations.",
  price: "49",
  originalPrice: "79",
  category: "fullstack",
  difficulty: "intermediate",
  setupTime: "15 minutes",
  estimatedValue: "₹2,00,000+",
  demoUrl: "https://dashboard-demo.example.com",
  githubUrl: "https://github.com/example/dashboard-pro",
  isActive: true,
  isFeatured: true,
  isBestseller: true,
  tags: ["Next.js", "Dashboard", "Charts", "TypeScript", "Tailwind CSS"],
  techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Recharts", "Prisma"],
  features: [
    "Responsive dashboard layout with sidebar navigation",
    "Interactive charts and analytics with Recharts",
    "Complete user management system with CRUD operations",
    "Dark/light mode support with theme persistence",
  ],
  includes: [
    "Complete source code with TypeScript",
    "Comprehensive documentation (50+ pages)",
    "Video setup tutorial (45 minutes)",
    "6 months of free updates",
  ],
  images: ["image1.jpg", "image2.jpg", "image3.jpg"],
}

const availableTags = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "CSS",
  "HTML",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Prisma",
  "Auth",
  "Dashboard",
  "E-commerce",
  "Blog",
  "Landing Page",
  "SaaS",
  "API",
  "Full-Stack",
  "Frontend",
  "Backend",
  "Mobile",
  "Responsive",
  "Dark Mode",
  "Charts",
  "Analytics",
]

const availableTech = [
  "Next.js 14",
  "React 18",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
  "Prisma",
  "NextAuth.js",
  "Stripe",
  "Recharts",
  "Radix UI",
  "shadcn/ui",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "Redis",
  "WebSocket",
]

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditBundlePage({ params }: PageProps) {
  const [id, setId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  
  // Handle the Promise params in useEffect
  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id)
      setIsLoading(false)
    })
  }, [params])
  
  const [formData, setFormData] = useState(mockBundleData)
  const [selectedTags, setSelectedTags] = useState<string[]>(mockBundleData.tags)
  const [selectedTech, setSelectedTech] = useState<string[]>(mockBundleData.techStack)
  const [features, setFeatures] = useState<string[]>(mockBundleData.features)
  const [includes, setIncludes] = useState<string[]>(mockBundleData.includes)
  const [images, setImages] = useState<string[]>(mockBundleData.images)
  const [newImages, setNewImages] = useState<File[]>([])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev: typeof mockBundleData) => ({
      ...prev,
      [field]: value,
    }))

    // Auto-generate slug from name
    if (field === "name" && typeof value === "string") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData((prev: typeof mockBundleData) => ({
        ...prev,
        slug,
      }))
    }
  }

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t: string) => t !== tag))
  }

  const addTech = (tech: string) => {
    if (!selectedTech.includes(tech)) {
      setSelectedTech([...selectedTech, tech])
    }
  }

  const removeTech = (tech: string) => {
    setSelectedTech(selectedTech.filter((t: string) => t !== tech))
  }

  const addFeature = () => {
    setFeatures([...features, ""])
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_: string, i: number) => i !== index))
  }

  const addInclude = () => {
    setIncludes([...includes, ""])
  }

  const updateInclude = (index: number, value: string) => {
    const newIncludes = [...includes]
    newIncludes[index] = value
    setIncludes(newIncludes)
  }

  const removeInclude = (index: number) => {
    setIncludes(includes.filter((_: string, i: number) => i !== index))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages([...newImages, ...Array.from(e.target.files)])
    }
  }

  const removeExistingImage = (index: number) => {
    setImages(images.filter((_: string, i: number) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_: File, i: number) => i !== index))
  }

  const handleUpdate = () => {
    const bundleData = {
      ...formData,
      tags: selectedTags,
      techStack: selectedTech,
      features: features.filter((f: string) => f.trim() !== ""),
      includes: includes.filter((i: string) => i.trim() !== ""),
      existingImages: images,
      newImages,
    }

    console.log("Updated bundle data:", bundleData)
    alert("Bundle updated successfully!")
  }

  const handleDelete = () => {
    console.log("Deleting bundle:", id)
    alert("Bundle deleted successfully!")
    // In real app: router.push('/admin/bundles')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bundle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/bundles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bundles
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Bundle</h1>
            <p className="text-muted-foreground">Update your bundle information and settings</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Bundle
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the bundle and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Bundle
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" asChild>
            <Link href={`/bundles/${formData.slug}`}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button onClick={handleUpdate}>
            <Save className="h-4 w-4 mr-2" />
            Update Bundle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Bundle Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Dashboard Pro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange("slug", e.target.value)}
                        placeholder="dashboard-pro"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description *</Label>
                    <Input
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                      placeholder="Complete admin dashboard solution with analytics and user management"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Detailed description of your bundle, its features, and benefits..."
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frontend">Frontend</SelectItem>
                          <SelectItem value="fullstack">Full-Stack</SelectItem>
                          <SelectItem value="backend">Backend</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty *</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) => handleInputChange("difficulty", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="setupTime">Setup Time</Label>
                      <Input
                        id="setupTime"
                        value={formData.setupTime}
                        onChange={(e) => handleInputChange("setupTime", e.target.value)}
                        placeholder="15 minutes"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Current Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        placeholder="49"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Original Price</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                        placeholder="79"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedValue">Estimated Value</Label>
                      <Input
                        id="estimatedValue"
                        value={formData.estimatedValue}
                        onChange={(e) => handleInputChange("estimatedValue", e.target.value)}
                        placeholder="₹2,00,000+"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add tags..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags
                        .filter((tag) => !selectedTags.includes(tag))
                        .map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technology Stack</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTech.map((tech: string) => (
                      <Badge key={tech} variant="outline" className="flex items-center gap-1">
                        {tech}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTech(tech)} />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addTech}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add technologies..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTech
                        .filter((tech) => !selectedTech.includes(tech))
                        .map((tech) => (
                          <SelectItem key={tech} value={tech}>
                            {tech}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Enter feature description..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        disabled={features.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {includes.map((include: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={include}
                        onChange={(e) => updateInclude(index, e.target.value)}
                        placeholder="Enter what's included..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeInclude(index)}
                        disabled={includes.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addInclude}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image: string, index: number) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">{image}</span>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeExistingImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {index === 0 && <Badge className="absolute bottom-2 left-2">Main Image</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add New Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">Upload Additional Images</p>
                      <p className="text-sm text-muted-foreground">Add more screenshots, previews, and demo images.</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button asChild className="mt-4">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        Choose Images
                      </label>
                    </Button>
                  </div>

                  {newImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {newImages.map((image: File, index: number) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">{image.name}</span>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeNewImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <Badge variant="secondary" className="absolute bottom-2 left-2">
                            New
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>URLs & Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demoUrl">Demo URL</Label>
                    <Input
                      id="demoUrl"
                      value={formData.demoUrl}
                      onChange={(e) => handleInputChange("demoUrl", e.target.value)}
                      placeholder="https://demo.example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      value={formData.githubUrl}
                      onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured</Label>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isBestseller">Bestseller</Label>
                <Switch
                  id="isBestseller"
                  checked={formData.isBestseller}
                  onCheckedChange={(checked) => handleInputChange("isBestseller", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bundle Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Sales:</span>
                <span className="font-semibold">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Revenue:</span>
                <span className="font-semibold">$7,644</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Downloads:</span>
                <span className="font-semibold">2,500+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rating:</span>
                <span className="font-semibold">4.9/5 (127 reviews)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="font-semibold">Jan 15, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <span className="font-semibold">Jan 20, 2024</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Bundle Preview</span>
                </div>
                <div>
                  <h3 className="font-semibold">{formData.name}</h3>
                  <p className="text-sm text-muted-foreground">{formData.shortDescription}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg">₹{formData.price}</span>
                    {formData.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through ml-2">₹{formData.originalPrice}</span>
                    )}
                  </div>
                  <Badge variant={formData.isActive ? "default" : "secondary"}>
                    {formData.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
