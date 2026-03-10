import { useMemo } from "react";
import { useAsync } from "../../utilis/useAsync";
import { URLS } from "../../../constants";

/**
 * Central hook that fetches real data from existing API endpoints
 * and computes all the report metrics that were previously mocked.
 */
export const useReportData = () => {
    // Fetch from existing endpoints
    const { data: enquiryRes, loading: enquiryLoading, error: enquiryError } = useAsync(URLS.ENQUIRY_URL);
    const { data: agentRes, loading: agentLoading } = useAsync(URLS.AGENT_URL);
    const { data: userRes, loading: userLoading } = useAsync(URLS.USER_GET_URL);
    const { data: destinationRes, loading: destinationLoading } = useAsync(URLS.DESTINATION_URL);
    const { data: hotelRes, loading: hotelLoading } = useAsync(URLS.HOTEL_URL);

    const enquiries = enquiryRes?.data || [];
    const agents = agentRes?.data || [];
    const users = userRes?.data || [];
    const destinations = destinationRes?.data || [];
    const hotels = hotelRes?.data || [];

    const loading = enquiryLoading || agentLoading || userLoading || destinationLoading || hotelLoading;
    const error = enquiryError;

    // ── Compute Sales Summary ──
    const salesSummary = useMemo(() => {
        const totalBookings = enquiries.length;
        const totalPax = enquiries.reduce((sum, e) => sum + (Number(e.adult_count) || 0) + (Number(e.child_count) || 0), 0);
        const confirmed = enquiries.filter(e => (e.status || e.enquiry_status || "").toLowerCase() === "confirmed");
        const confirmedCount = confirmed.length;
        const conversionRate = totalBookings > 0 ? ((confirmedCount / totalBookings) * 100).toFixed(1) : 0;

        return {
            totalBookings,
            totalPax,
            totalRevenue: 0, // Backend doesn't have revenue field yet on enquiries
            totalCost: 0,
            grossProfit: 0,
            profitMargin: 0,
            confirmedCount,
            conversionRate: Number(conversionRate),
        };
    }, [enquiries]);

    // ── Compute Destination Sales ──
    const destinationSales = useMemo(() => {
        const destMap = {};
        enquiries.forEach((e) => {
            const destName = e.destination?.name || "Unknown";
            const destId = e.destination?.id || 0;
            if (!destMap[destName]) {
                destMap[destName] = { id: destId, destination: destName, bookings: 0, pax: 0, revenue: 0, profit: 0, margin: 0, marketShare: 0 };
            }
            destMap[destName].bookings += 1;
            destMap[destName].pax += (Number(e.adult_count) || 0) + (Number(e.child_count) || 0);
        });
        const arr = Object.values(destMap);
        const totalBookings = arr.reduce((s, d) => s + d.bookings, 0);
        arr.forEach(d => {
            d.marketShare = totalBookings > 0 ? Math.round((d.bookings / totalBookings) * 100) : 0;
        });
        return arr.sort((a, b) => b.bookings - a.bookings);
    }, [enquiries]);

    // ── Compute Sales Staff Data ──
    const salesStaffData = useMemo(() => {
        const staffMap = {};
        enquiries.forEach((e) => {
            const user = e.assigned_to_user;
            if (!user) return;
            const staffId = user.id;
            const staffName = [user.first_name, user.last_name].filter(Boolean).join(" ") || `User ${staffId}`;
            if (!staffMap[staffId]) {
                staffMap[staffId] = {
                    id: staffId,
                    name: staffName,
                    avatar: staffName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
                    email: user.email || "",
                    phone: user.phone || "",
                    bookings: 0,
                    pax: 0,
                    revenue: 0,
                    profit: 0,
                    totalEnquiries: 0,
                    confirmedCount: 0,
                    conversionRate: 0,
                };
            }
            staffMap[staffId].bookings += 1;
            staffMap[staffId].totalEnquiries += 1;
            staffMap[staffId].pax += (Number(e.adult_count) || 0) + (Number(e.child_count) || 0);
            const status = (e.status || e.enquiry_status || "").toLowerCase();
            if (status === "confirmed" || status === "complete") {
                staffMap[staffId].confirmedCount += 1;
            }
        });
        const arr = Object.values(staffMap);
        arr.forEach(s => {
            s.conversionRate = s.totalEnquiries > 0 ? Math.round((s.confirmedCount / s.totalEnquiries) * 100) : 0;
        });
        return arr.sort((a, b) => b.bookings - a.bookings);
    }, [enquiries]);

    // ── Compute Agent Performance ──
    const agentPerformance = useMemo(() => {
        const agentMap = {};
        enquiries.forEach((e) => {
            const agent = e.agent;
            if (!agent) return;
            const agentId = agent.id;
            if (!agentMap[agentId]) {
                agentMap[agentId] = {
                    id: agentId,
                    agentName: agent.name || `Agent ${agentId}`,
                    contact: agent.contact_person || agent.name || "",
                    email: agent.email || "",
                    phone: agent.phone || "",
                    bookings: 0,
                    revenue: 0,
                    commission: 0,
                    outstanding: 0,
                    status: "Active",
                };
            }
            agentMap[agentId].bookings += 1;
        });
        return Object.values(agentMap).sort((a, b) => b.bookings - a.bookings);
    }, [enquiries]);

    // ── Compute Monthly Sales ──
    const monthlySales = useMemo(() => {
        const monthMap = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        enquiries.forEach((e) => {
            const date = e.start_date ? new Date(e.start_date) : (e.created_at ? new Date(e.created_at) : null);
            if (!date || isNaN(date.getTime())) return;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            if (!monthMap[key]) {
                monthMap[key] = { month: label, sortKey: key, bookings: 0, revenue: 0, profit: 0, pax: 0 };
            }
            monthMap[key].bookings += 1;
            monthMap[key].pax += (Number(e.adult_count) || 0) + (Number(e.child_count) || 0);
        });
        return Object.values(monthMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [enquiries]);

    // ── Compute Package Types (by requirements/lead_source) ──
    const packageTypes = useMemo(() => {
        const pkgMap = {};
        enquiries.forEach((e) => {
            const reqs = Array.isArray(e.requirements) ? e.requirements : [];
            if (reqs.length === 0) {
                const key = "General";
                if (!pkgMap[key]) pkgMap[key] = { id: 0, packageType: key, bookings: 0, pax: 0, revenue: 0, profit: 0 };
                pkgMap[key].bookings += 1;
                pkgMap[key].pax += (Number(e.adult_count) || 0) + (Number(e.child_count) || 0);
            } else {
                reqs.forEach(r => {
                    const key = r.name || "Other";
                    if (!pkgMap[key]) pkgMap[key] = { id: r.id || 0, packageType: key, bookings: 0, pax: 0, revenue: 0, profit: 0 };
                    pkgMap[key].bookings += 1;
                    pkgMap[key].pax += (Number(e.adult_count) || 0) + (Number(e.child_count) || 0);
                });
            }
        });
        return Object.values(pkgMap).sort((a, b) => b.bookings - a.bookings);
    }, [enquiries]);

    // ── Compute Sales By Channel (Lead Source) ──
    const salesByAgent = useMemo(() => {
        const channelMap = {};
        enquiries.forEach((e) => {
            const channel = e.lead_source?.name || "Direct";
            if (!channelMap[channel]) {
                channelMap[channel] = { id: 0, channel, bookings: 0, pax: 0, revenue: 0, profit: 0 };
            }
            channelMap[channel].bookings += 1;
            channelMap[channel].pax += (Number(e.adult_count) || 0) + (Number(e.child_count) || 0);
        });
        return Object.values(channelMap).sort((a, b) => b.bookings - a.bookings);
    }, [enquiries]);

    // ── Top Packages (by sub-destinations, i.e. itinerary combinations) ──
    const topPackages = useMemo(() => {
        const pkgMap = {};
        enquiries.forEach((e) => {
            const subDests = Array.isArray(e.sub_destinations) ? e.sub_destinations : [];
            const pkgName = subDests.length > 0
                ? subDests.map(d => d.name).join(" + ")
                : (e.destination?.name || "Custom Package");
            const dest = e.destination?.name || "Various";
            if (!pkgMap[pkgName]) {
                pkgMap[pkgName] = { id: Object.keys(pkgMap).length + 1, packageName: pkgName, destination: dest, pax: 0, revenue: 0, bookings: 0 };
            }
            pkgMap[pkgName].bookings += 1;
            pkgMap[pkgName].pax += (Number(e.adult_count) || 0) + (Number(e.child_count) || 0);
        });
        return Object.values(pkgMap).sort((a, b) => b.bookings - a.bookings).slice(0, 10);
    }, [enquiries]);

    // ── Hotel Reports (from hotels list + counts) ──
    const hotelReports = useMemo(() => {
        return hotels.map((h, i) => ({
            id: h.id || i + 1,
            hotelName: h.name || h.hotel_name || `Hotel ${i + 1}`,
            destination: h.destination?.name || h.city || "Unknown",
            bookings: 0,
            nights: 0,
            revenue: 0,
            rating: h.rating || h.star_rating || 0,
            occupancy: 0,
        }));
    }, [hotels]);

    return {
        loading,
        error,
        enquiries,
        agents,
        users,
        destinations,
        hotels,
        salesSummary,
        destinationSales,
        salesStaffData,
        agentPerformance,
        monthlySales,
        packageTypes,
        salesByAgent,
        topPackages,
        hotelReports,
    };
};

/** CSV export helper (kept from mockData.js) */
export const handleExport = (data, filename, headers, mapRow) => {
    const csvContent = [
        headers.join(","),
        ...data.map(row => mapRow(row).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
