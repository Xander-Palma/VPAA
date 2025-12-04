import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Users, Clock, ArrowRight, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'

interface Event {
  id: number
  title: string
  category: string
  date: string
  time: string
  location: string
  attendees: number
  image?: string
  organizer: string
}

const categories = [
  { id: 'all', label: 'All Events' },
  { id: 'seminar', label: 'Seminars' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'training', label: 'Trainings' },
  { id: 'conference', label: 'Conferences' },
]

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Advanced Programming Workshop',
    category: 'workshop',
    date: 'Dec 10, 2025',
    time: '2:00 PM - 5:00 PM',
    location: 'Tech Hub',
    attendees: 45,
    organizer: 'CET Department',
  },
  {
    id: 2,
    title: 'Leadership Development Seminar',
    category: 'seminar',
    date: 'Dec 15, 2025',
    time: '9:00 AM - 12:00 PM',
    location: 'Main Conference Room',
    attendees: 120,
    organizer: 'VPAA',
  },
  {
    id: 3,
    title: 'Web Development Bootcamp',
    category: 'workshop',
    date: 'Dec 20, 2025',
    time: '1:00 PM - 4:00 PM',
    location: 'Online',
    attendees: 78,
    organizer: 'CET Events',
  },
  {
    id: 4,
    title: 'HCDC General Assembly',
    category: 'conference',
    date: 'Dec 25, 2025',
    time: '10:00 AM - 1:00 PM',
    location: 'Main Auditorium',
    attendees: 250,
    organizer: 'HCDC',
  },
  {
    id: 5,
    title: 'Data Science Webinar',
    category: 'seminar',
    date: 'Dec 18, 2025',
    time: '7:00 PM - 8:30 PM',
    location: 'Online',
    attendees: 156,
    organizer: 'CET Events',
  },
  {
    id: 6,
    title: 'Professional Skills Training',
    category: 'training',
    date: 'Dec 28, 2025',
    time: '9:00 AM - 4:00 PM',
    location: 'Training Center',
    attendees: 89,
    organizer: 'HR Department',
  },
]

export default function EventsPage() {
  const [, setLocation] = useLocation()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents)

  useEffect(() => {
    const filtered = mockEvents.filter(event => {
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    setFilteredEvents(filtered)
  }, [selectedCategory, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <button
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">Discover Events</h1>
          <p className="text-lg text-muted-foreground mb-8 text-balance">Find and join seminars, trainings, and workshops that matter</p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-base"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-2">
                <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">{filteredEvents.length} events found</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredEvents.map(event => (
                  <Card
                    key={event.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group border border-border"
                  >
                    {/* Event Image */}
                    <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center">
                        <CalendarIcon className="w-16 h-16 text-primary/30" />
                      </div>
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground capitalize">
                        {event.category}
                      </Badge>
                    </div>

                    {/* Event Details */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-foreground line-clamp-2">{event.title}</h3>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">{event.organizer}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="group/btn"
                          onClick={() => setLocation(`/events/${event.id}`)}
                        >
                          Register
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No events found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
