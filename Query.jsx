'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Plus, User, Phone, RefreshCcw, FileBoxIcon, Mail, Calendar, Hash, IndianRupee } from 'lucide-react'
import { useAllLeadsQuery } from '@/services/api'
import { selectUserId, selectRole } from '@/store/loginReducer'
import { selectEmpId } from '@/store/empLoginReducer'
import { useSelector } from 'react-redux'
import LeadDetailsView from '../lead/ViewLead'
import axios from 'axios'
import { ChevronLeft, ChevronRight, Tags } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import SendQuery from './SendQuery'
import { format, formatDistanceToNow } from 'date-fns'
import { useGetStatusesQuery } from '@/services/queryStatusOptions.api'
import AgencyAdminPage from '@/pages/AgencyAdmin/AgencyAdminPage'
import getItemColor from '@/utils/getItemColor'
import { useGetTagsQuery } from '@/services/general.api'
import FollowUpDateCell from '../lead/FollowUpDateCell'
const ITEMS_PER_PAGE = 5
import Cookies from 'js-cookie'
import Quote from './quote/Quote'
import ItineraryUpdateForm from './quote/ItineraryUpdateForm'
import AttractivePlace from './quote/AttractivePlace'
import ImprovedSidebar from './ImprovedSidebar'
import OtherQuotation from './OtherQuotation'
import LeadDisplay from './LeadDisplay'
import HorizontalStatusBar from './HorizontalStatusBar'
export default function LeadManagement() {
  const userId = useSelector(selectUserId)
  const empId = Cookies.get('id');
  const role = useSelector(selectRole)

  const dN = useSelector(state => state.login.dN);
  let ids = userId ? userId : empId;
  const { data: leadData, isLoading, isError, refetch } = useAllLeadsQuery({ ids, role })
  const { data: STATUS_OPTIONS, isLoading: loadingstaus } = useGetStatusesQuery();
  const { data: tags, isLoading: isLoadingTag, isError: IsErrerTags } = useGetTagsQuery();
  const [leads, setLeads] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeStatus, setActiveStatus] = useState('')
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isViewLeadModalOpen, setIsViewLeadModalOpen] = useState(false)
  const [isSendQueryModalOpen, setIsSendQueryModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [prefixCode, setPrefixCode] = useState('');

  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (open) => {
    setIsOpen(open)
  }

  const handleClose = () => {
    setIsOpen(false)
  }
  useEffect(() => {
    if (leadData) {
      setLeads(leadData)
    }

  }, [leadData])
  useEffect(() => {
    if (leadData) {
      setLeads(leadData)

      // If there is a selected lead, find the new version of it from the fetched data
      if (selectedLead) {
        const updatedLead = leadData.find(lead => lead.leadId === selectedLead.leadId);

        // If the lead still exists in the new data, update it
        if (updatedLead) {
          setSelectedLead(updatedLead);
        } else {
          // Optional: Handle case where the selected lead no longer exists (e.g., deleted)
          setSelectedLead(null);
        }
      }
    }
  }, [leadData, selectedLead])

  useEffect(() => {
    if (STATUS_OPTIONS && STATUS_OPTIONS.length > 0) {
      setActiveStatus(STATUS_OPTIONS[0].value)
    }

  }, [STATUS_OPTIONS])

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts = {}
    leads.forEach(lead => {
      counts[lead.status] = (counts[lead.status] || 0) + 1
    })
    return counts
  }, [leads])

  const filteredLeads = leads.filter(lead => {
    // Check if lead matches the active status filter
    const statusMatch = activeStatus === 'all' || lead.status === activeStatus;

    // Safely access and lowercase the search term
    const lowercaseSearchTerm = searchTerm.toLowerCase();

    // Check if lead ID matches (assuming leadId is always a string)
    const idMatch = lead.leadId.toLowerCase().includes(lowercaseSearchTerm);

    // Safely check if customer name matches
    const nameMatch = typeof lead.customerData?.[0]?.name === 'string' &&
      lead.customerData[0].name.toLowerCase().includes(lowercaseSearchTerm);

    // Check if phone matches (assuming phone is always a string)
    const phoneMatch = lead.customerData?.[0]?.phone?.includes(searchTerm);

    // Return true if the lead matches all criteria
    return statusMatch && (idMatch || nameMatch || phoneMatch);
  });


  useEffect(() => {

    const fetchPrefix = async () => {
      try {
        const response = await axios.get('/api/prefix-code', {
          headers: {
            'X-Tenant-Id': dN,
          },
        });

        // Set the prefix state here after fetching
        setPrefixCode(response.data);
        // toast.success('Prefix fetched successfully!');
      } catch (error) {
        console.error('Error fetching prefix:', error);
        // toast.error('Failed to fetch prefix');
      }
    };
    fetchPrefix();
  }, [])
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentLeads = filteredLeads.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }
  const handleQuote = (lead) => {
    setSelectedLead(lead)
    setIsQuoteModalOpen(true)
  }


  if (isLoading && loadingstaus) return <p>Loading...</p>

  const isTripOrPackage = selectedLead?.serviceType?.toLowerCase() === 'trip' ||
    selectedLead?.serviceType?.toLowerCase() === 'package';

  const handleViewLead = (lead) => {
    setSelectedLead(lead)
    setIsViewLeadModalOpen(true)
  }

  const handleSendQuery = (lead) => {
    setSelectedLead(lead)
    setIsSendQueryModalOpen(true)
  }


  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch();
    setTimeout(() => setIsRefreshing(false), 1000); // Reset after 1 second
  };




  // if (isError) return <p>Error loading leads. Please try again later.</p>

  return (
    <div className=" bg-gray-100  flex flex-col md:flex-row mb-2">
      {/* Sidebar */}
      {STATUS_OPTIONS &&
        <ImprovedSidebar
          STATUS_OPTIONS={STATUS_OPTIONS}
          statusCounts={statusCounts}
          activeStatus={activeStatus}
          setActiveStatus={setActiveStatus}
          getItemColor={getItemColor}
        />
      }
      {STATUS_OPTIONS &&
        <HorizontalStatusBar
          STATUS_OPTIONS={STATUS_OPTIONS}
          statusCounts={statusCounts}
          activeStatus={activeStatus}
          setActiveStatus={setActiveStatus}
          getItemColor={getItemColor}
        />
      }

      {/* Main content */}
      <div className="flex-1 overflow-auto  m-1">
        <div className="mb-6 flex justify-between items-center">
          <Input
            type="text"
            placeholder="Search by ID, name, or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <div className='gap-3'>


            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button className="text-white m-2">
                  <Plus />
                  <span className='hidden md:hidden'>
                    Add New Query
                  </span>
                </Button>

              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[85vh] p-0 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle></DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[80vh] overflow-y-auto">
                  <AgencyAdminPage onClose={handleClose} />
                </ScrollArea>
              </DialogContent>
            </Dialog>
            {/* <Button
              onClick={handleRefresh}
              className={`text-white ml-3 transition-transform duration-500 ease-in-out ${isRefreshing ? 'rotate-180' : ''}`}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`${isRefreshing ? 'animate-spin' : ''}`} />
            </Button> */}

          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:hidden">
          {currentLeads.map((lead) => (
            <Card key={lead._id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span onClick={() => handleViewLead(lead)} className="flex items-center cursor-pointer hover:underline">
                    <Hash className="h-4 w-4 mr-1" />
                    {lead.leadId}
                  </span>
                  <span className={`${getItemColor(lead.status, STATUS_OPTIONS)} text-sm px-2 py-1 rounded-full`}>
                    {lead.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span className="font-medium cursor-pointer hover:text-blue-600" onClick={() => handleViewLead(lead)}>
                      {Array.isArray(lead.customerData?.[0]?.name) ? lead.customerData[0].name.join(', ') : lead.customerData?.[0]?.name}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {lead.customerData?.[0]?.phone}
                  </p>
                  <span className="text-blue-800 font-medium py-1 px-2 rounded inline-flex items-center">
                    <span className="w-2 h-2 bg-blue-800 rounded-full mr-2"></span>
                    {lead.serviceType || 'N/A'}
                  </span>
                  <span className={`${getItemColor(lead.tags, tags)} text-xs font-medium px-2 py-1 rounded-full`}>
                    {lead.tags}
                  </span>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(lead.lastUpdated), 'dd MMM, yyyy')} ({formatDistanceToNow(new Date(lead.lastUpdated), { addSuffix: true })})
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Follow-up:</span>
                    {lead.followUp || 'Not scheduled'}
                  </p>
                  <div className="flex space-x-2 justify-end items-center ">
                    <Button className="bg-blue-600 text-white  mb-1 mr-3" onClick={() => handleQuote(lead)} variant="outline" size="sm">
                      <FileBoxIcon className="h-4 w-4" />
                      Quote
                    </Button>
                    <Button onClick={() => handleSendQuery(lead)} variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" /> Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="bg-white hidden md:block rounded-lg shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLeads.map((lead) => (
                <TableRow key={lead._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <LeadDisplay
                      lead={lead}
                      prefixCode={prefixCode}
                      handleViewLead={handleViewLead}
                    />
                  </TableCell>
                  <TableCell >
                    <p className="font-medium cursor-pointer" onClick={() => handleViewLead(lead)} >{Array.isArray(lead.customerData?.[0]?.name) ? lead.customerData[0].name.join(', ') : lead.customerData?.[0]?.name}</p>
                    <p className="text-sm text-gray-600">{lead.customerData?.[0]?.phone}</p>
                  </TableCell>
                  <TableCell>
                    <p>{format(new Date(lead.lastUpdated), 'dd MMM, yyyy')}</p>
                    <p className="text-sm text-gray-600">({formatDistanceToNow(new Date(lead.lastUpdated), { addSuffix: true })})</p>
                  </TableCell>
                  <TableCell>
                    <span className="bg-blue-100 text-blue-800 font-medium py-1 px-2 rounded-full inline-flex items-center">
                      <span className="w-2 h-2 bg-blue-800 rounded-full mr-2"></span>
                      {lead.serviceType || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`${getItemColor(lead.tags, tags)} text-xs  font-medium px-2 py-1 rounded-full`}>
                      {lead.tags}
                    </span>
                  </TableCell>
                  <TableCell>
                    {lead.followUpDate ?

                      <FollowUpDateCell followUpDate={lead.followUpDate} />
                      : 'Not scheduled'}
                  </TableCell>
                  <TableCell className="text-right gap-3 ">
                    <Button className="bg-blue-600 text-white  mb-1 " onClick={() => handleQuote(lead)} variant="outline" size="sm">
                      <FileBoxIcon className="h-4 w-4" />
                      Quote
                    </Button>
                    <Button className="ml-3" onClick={() => handleSendQuery(lead)} variant="outline" size="sm">
                      <Send className="h-4 w-4" />  Send
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-1 bg-gray-50 border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, leads.length)}</span> of{' '}
                  <span className="font-medium">{leads.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="rounded-l-md"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      className={`${currentPage === i + 1 ? 'z-10' : ''}`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="rounded-r-md"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-1 mx-2 flex justify-between items-center">
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <div className="space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogTitle>

          </DialogTitle>
          <ScrollArea className="h-[80vh] overflow-y-auto">
            {isTripOrPackage ? <ItineraryUpdateForm selectedLead={selectedLead} />
              :
              <OtherQuotation selectedLead={selectedLead} />
            }

            {/* <AttractivePlace/>  //Attraction place */}
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <LeadDetailsView
        isOpen={isViewLeadModalOpen}
        refetch={refetch}
        onOpenChange={setIsViewLeadModalOpen}
        selectedLead={selectedLead}
      />

      <SendQuery
        isOpen={isSendQueryModalOpen}
        onOpenChange={setIsSendQueryModalOpen}
        selectedLead={selectedLead}
        refetch={refetch}
      />

    </div>
  )
}
