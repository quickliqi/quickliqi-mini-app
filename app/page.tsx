"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { DealsList } from "@/components/dashboard/deals-list"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { BottomNav, type NavTab } from "@/components/dashboard/bottom-nav"
import { DealDetailSheet } from "@/components/dashboard/deal-detail-sheet"
import { PropertiesView } from "@/components/views/properties-view"
import { BuyersView } from "@/components/views/buyers-view"
import { SettingsView } from "@/components/views/settings-view"
import { createClient } from "@/lib/supabase/client"
import type { Deal, DashboardStats, SwarmActivity, BuyerMatch, Property, Buyer } from "@/lib/types"

// Demo data for initial state
const demoStats: DashboardStats = {
  totalDeals: 47,
  activeDeals: 12,
  closedDeals: 28,
  totalRevenue: 285000,
  avgAssignmentFee: 10178,
  conversionRate: 59.6,
  propertiesScraped: 1247,
  highDistressCount: 89,
}

const demoDeals: Deal[] = [
  {
    id: "1",
    deal_type: "assignment",
    status: "negotiating",
    contract_price: 145000,
    assignment_fee: 12500,
    arv: 215000,
    mao: 150500,
    confidence_score: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    property: {
      id: "p1",
      address: "1247 Oak Street",
      city: "Phoenix",
      state: "AZ",
      zipcode: "85004",
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1650,
      distress_score: 72,
      tax_delinquent: true,
      vacancy_flag: true,
      probate_flag: false,
      scraped_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    seller: {
      id: "s1",
      first_name: "Maria",
      last_name: "Gonzalez",
      phone: "(602) 555-0147",
      email: "maria.g@email.com",
      motivation_level: 8,
      situation_type: "relocation",
      contact_attempts: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "2",
    deal_type: "double_close",
    status: "under_contract",
    contract_price: 198000,
    assignment_fee: 18000,
    arv: 285000,
    mao: 199500,
    confidence_score: 92,
    contract_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    closing_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    property: {
      id: "p2",
      address: "892 Maple Avenue",
      city: "Scottsdale",
      state: "AZ",
      zipcode: "85251",
      bedrooms: 4,
      bathrooms: 2.5,
      sqft: 2100,
      distress_score: 65,
      tax_delinquent: false,
      vacancy_flag: true,
      probate_flag: true,
      scraped_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "3",
    deal_type: "subject_to",
    status: "lead",
    arv: 320000,
    confidence_score: 58,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    property: {
      id: "p3",
      address: "456 Pine Road",
      city: "Mesa",
      state: "AZ",
      zipcode: "85201",
      bedrooms: 5,
      bathrooms: 3,
      sqft: 2800,
      distress_score: 45,
      tax_delinquent: true,
      tax_delinquent_amount: 8500,
      vacancy_flag: false,
      probate_flag: false,
      foreclosure_status: "pre-foreclosure",
      scraped_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "4",
    deal_type: "assignment",
    status: "closed",
    contract_price: 175000,
    assignment_fee: 15000,
    arv: 245000,
    actual_close_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    property: {
      id: "p4",
      address: "321 Birch Lane",
      city: "Tempe",
      state: "AZ",
      zipcode: "85281",
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1500,
      distress_score: 80,
      tax_delinquent: true,
      vacancy_flag: true,
      probate_flag: false,
      scraped_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
]

const demoActivities: SwarmActivity[] = [
  {
    id: "a1",
    agent_name: "PropertyScout",
    action_type: "Scanning tax records",
    city: "Phoenix",
    state: "AZ",
    properties_found: 23,
    status: "completed",
    started_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    completed_at: new Date().toISOString(),
  },
  {
    id: "a2",
    agent_name: "BuyerMatcher",
    action_type: "Matching buyers to deals",
    buyers_matched: 8,
    deals_analyzed: 12,
    status: "completed",
    started_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    completed_at: new Date().toISOString(),
  },
  {
    id: "a3",
    agent_name: "DistressAnalyzer",
    action_type: "Calculating distress scores",
    city: "Scottsdale",
    state: "AZ",
    properties_found: 15,
    status: "running",
    started_at: new Date().toISOString(),
  },
]

const demoBuyerMatches: BuyerMatch[] = [
  {
    id: "bm1",
    deal_id: "1",
    buyer_id: "b1",
    confidence_score: 92,
    zipcode_match: true,
    city_match: true,
    state_match: true,
    price_in_range: true,
    property_type_match: true,
    structure_preference_match: true,
    similar_deals_closed: 5,
    similar_deals_rejected: 1,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    buyer: {
      id: "b1",
      company_name: "Desert Flip Investments",
      contact_name: "James Chen",
      close_rate: 78.5,
      reliability_score: 95,
      total_deals_closed: 42,
      total_deals_pitched: 54,
      is_active: true,
      is_verified: true,
      proof_of_funds_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "bm2",
    deal_id: "1",
    buyer_id: "b2",
    confidence_score: 85,
    zipcode_match: false,
    city_match: true,
    state_match: true,
    price_in_range: true,
    property_type_match: true,
    structure_preference_match: true,
    similar_deals_closed: 3,
    similar_deals_rejected: 2,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    buyer: {
      id: "b2",
      company_name: "Southwest Home Buyers",
      contact_name: "Sarah Martinez",
      close_rate: 65.0,
      reliability_score: 88,
      total_deals_closed: 28,
      total_deals_pitched: 43,
      is_active: true,
      is_verified: true,
      proof_of_funds_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [swarmStatus, setSwarmStatus] = useState<'idle' | 'running' | 'error'>('idle')
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  
  // State for real data (falls back to demo data)
  const [stats, setStats] = useState<DashboardStats>(demoStats)
  const [deals, setDeals] = useState<Deal[]>(demoDeals)
  const [activities, setActivities] = useState<SwarmActivity[]>(demoActivities)
  const [buyerMatches, setBuyerMatches] = useState<BuyerMatch[]>(demoBuyerMatches)
  const [properties, setProperties] = useState<Property[]>([])
  const [buyers, setBuyers] = useState<Buyer[]>([])

  const supabase = createClient()

  // Fetch real data from Supabase
  const fetchData = useCallback(async () => {
    try {
      // Fetch deals with related data
      const { data: dealsData } = await supabase
        .from('deals')
        .select(`
          *,
          property:properties(*),
          seller:sellers(*),
          buyer:buyers(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (dealsData && dealsData.length > 0) {
        setDeals(dealsData as Deal[])
      }

      // Fetch properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .order('distress_score', { ascending: false })
        .limit(100)

      if (propertiesData) {
        setProperties(propertiesData as Property[])
      }

      // Fetch buyers
      const { data: buyersData } = await supabase
        .from('buyers')
        .select('*')
        .eq('is_active', true)
        .order('reliability_score', { ascending: false })
        .limit(50)

      if (buyersData) {
        setBuyers(buyersData as Buyer[])
      }

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from('swarm_activity_log')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10)

      if (activityData && activityData.length > 0) {
        setActivities(activityData as SwarmActivity[])
      }

      // Calculate stats
      const { count: totalDeals } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })

      const { count: activeDeals } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .in('status', ['lead', 'contacted', 'negotiating', 'under_contract'])

      const { count: closedDeals } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'closed')

      const { data: revenueData } = await supabase
        .from('deals')
        .select('assignment_fee')
        .eq('status', 'closed')
        .not('assignment_fee', 'is', null)

      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })

      const { count: highDistress } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .gte('distress_score', 60)

      if (totalDeals) {
        const totalRevenue = revenueData?.reduce((sum, d) => sum + (d.assignment_fee || 0), 0) || 0
        const avgFee = closedDeals ? totalRevenue / closedDeals : 0
        const convRate = totalDeals > 0 ? ((closedDeals || 0) / totalDeals) * 100 : 0

        setStats({
          totalDeals: totalDeals || 0,
          activeDeals: activeDeals || 0,
          closedDeals: closedDeals || 0,
          totalRevenue,
          avgAssignmentFee: avgFee,
          conversionRate: convRate,
          propertiesScraped: propertiesCount || 0,
          highDistressCount: highDistress || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle swarm toggle
  const handleToggleSwarm = async () => {
    if (swarmStatus === 'running') {
      setSwarmStatus('idle')
      // Log swarm stop
      await supabase.from('swarm_activity_log').insert({
        agent_name: 'SwarmController',
        action_type: 'Swarm stopped by user',
        status: 'completed',
      })
    } else {
      setSwarmStatus('running')
      // Log swarm start
      await supabase.from('swarm_activity_log').insert({
        agent_name: 'SwarmController',
        action_type: 'Swarm started: Orlando, FL',
        status: 'running',
      })
      
      // Simulate activity updates
      const newActivity: SwarmActivity = {
        id: `a-${Date.now()}`,
        agent_name: 'PropertyScout',
        action_type: 'Scanning property records',
        city: 'Phoenix',
        state: 'AZ',
        status: 'running',
        started_at: new Date().toISOString(),
      }
      setActivities(prev => [newActivity, ...prev])
    }
  }

  // Handle deal selection
  const handleDealClick = async (deal: Deal) => {
    setSelectedDeal(deal)
    setDetailOpen(true)

    // Fetch buyer matches for this deal
    const { data: matches } = await supabase
      .from('buyer_matches')
      .select(`
        *,
        buyer:buyers(*)
      `)
      .eq('deal_id', deal.id)
      .order('confidence_score', { ascending: false })
      .limit(10)

    if (matches && matches.length > 0) {
      setBuyerMatches(matches as BuyerMatch[])
    }
  }

  return (
    <div className="flex min-h-screen flex-col pb-16">
      <Header swarmStatus={swarmStatus} onToggleSwarm={handleToggleSwarm} />
      
      <main className="flex flex-1 flex-col gap-4 py-4">
        {activeTab === 'dashboard' && (
          <>
            <StatsCards stats={stats} />
            <ActivityFeed activities={activities} />
            <DealsList deals={deals} onDealClick={handleDealClick} />
          </>
        )}
        
        {activeTab === 'properties' && (
          <PropertiesView properties={properties} />
        )}
        
        {activeTab === 'buyers' && (
          <BuyersView buyers={buyers} />
        )}
        
        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <DealDetailSheet 
        deal={selectedDeal}
        buyerMatches={buyerMatches}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
