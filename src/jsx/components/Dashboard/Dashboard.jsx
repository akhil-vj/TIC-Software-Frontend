import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import ApexCharts from "apexcharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Dropdown } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import ReactApexChart from "react-apexcharts";
import { useAsync } from "../../utilis/useAsync";
import { URLS } from "../../../constants";

/* ─────────────────────────────────────────────────────────────────────────────
   INJECTED STYLES
───────────────────────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.dsh *, .dsh *::before, .dsh *::after {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
  box-sizing: border-box;
}

/* ═══════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════ */
.dsh {
  padding: 0;
  background: #eef1f6;
  margin: -30px -30px -30px -30px;
}

/* ═══════════════════════════════════════════════
   PAGE HEADER — white bg, bottom border only
═══════════════════════════════════════════════ */
.dsh-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #ffffff;
  padding: 20px 28px;
  border: none;
  border-bottom: 1.5px solid #e8ecf4;
  box-shadow: none;
  margin: 0;
}

.dsh-hdr-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dsh-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: #0f1629;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.dsh-subtitle {
  font-size: 0.8rem;
  color: #8b95a8;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.1px;
}

/* Right: date pill + button + dots */
.dsh-hdr-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* ── Date range pill — sits inside white header, gray bg pill ── */
.dsh-date-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f4f6fb;
  border: 1.5px solid #dde3ed;
  border-radius: 10px;
  padding: 8px 13px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  position: relative;
  overflow: visible !important;
  z-index: 10;
}

.dsh-date-pill .cal-icon { color: #3b5bdb; flex-shrink: 0; }

.dsh-dp .react-datepicker-wrapper,
.dsh-dp .react-datepicker__input-container,
.dsh-dp input {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  font-family: inherit !important;
  font-size: 0.84rem !important;
  font-weight: 600 !important;
  color: #1e2535 !important;
  cursor: pointer;
  width: 88px;
  padding: 0 !important;
  margin: 0 !important;
}

.dsh-date-sep {
  font-size: 0.84rem;
  font-weight: 500;
  color: #9aa3b0;
}

.react-datepicker__popper {
  z-index: 9999 !important;
}

.react-datepicker {
  z-index: 9999 !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
}

.react-datepicker__day--in-range:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end) {
  background-color: transparent !important;
  color: #9aa3b0 !important;
}

.react-datepicker__day--range-start,
.react-datepicker__day--range-end {
  background-color: #3b82f6 !important;
  color: #fff !important;
  font-weight: 600;
}

.dsh-date-chevron {
  display: flex;
  align-items: center;
  margin-left: 4px;
  color: #9aa3b0;
}

/* ── New Enquiry button ── */
.dsh-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #3b5bdb;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 9px 20px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(59,91,219,0.38);
  transition: background 0.13s, box-shadow 0.13s, transform 0.1s;
  white-space: nowrap;
  letter-spacing: 0.1px;
}

.dsh-cta:hover {
  background: #2f4cc8;
  box-shadow: 0 6px 20px rgba(59,91,219,0.46);
  transform: translateY(-1px);
}

/* ── Dots (···) button in header — borderless, subtle ── */
.dsh-dots-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: background 0.13s;
  padding: 0;
  flex-shrink: 0;
}

.dsh-dots-btn:hover { background: #eef1f6; }

/* ═══════════════════════════════════════════════
   CONTENT PADDING WRAPPER
═══════════════════════════════════════════════ */
.dsh-content {
  padding: 0 28px 40px;
}

/* ═══════════════════════════════════════════════
   KPI CARDS
═══════════════════════════════════════════════ */
.dsh-kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: -5px;
  margin-top: 16px;
}

@media (max-width: 1199px) { .dsh-kpi-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 575px)  { .dsh-kpi-row { grid-template-columns: 1fr; } }

.dsh-kpi-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px 20px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(15,22,41,0.07);
  border: none;
  position: relative;
  transition: box-shadow 0.15s, transform 0.15s;
}

.dsh-kpi-card:hover {
  box-shadow: 0 6px 20px rgba(15,22,41,0.11);
  transform: translateY(-1px);
}

/* Icon square — left */
.dsh-kpi-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

.dsh-kpi-card:hover .dsh-kpi-icon {
  animation: shake-kpi 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake-kpi {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* Text block — grows */
.dsh-kpi-body {
  flex: 1;
  min-width: 0;
}

.dsh-kpi-num {
  font-size: 2rem;
  font-weight: 800;
  color: #0f1629;
  line-height: 1;
  letter-spacing: -0.6px;
}

.dsh-kpi-lbl {
  font-size: 0.78rem;
  color: #8b95a8;
  margin-top: 5px;
  font-weight: 500;
  line-height: 1.3;
}

/* Badge — absolute top-right */
.dsh-kpi-badge {
  position: absolute;
  top: 14px;
  right: 16px;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 0.73rem;
  font-weight: 700;
  white-space: nowrap;
}

.dsh-kpi-badge.up   { background: #ecfdf5; color: #16a34a; }
.dsh-kpi-badge.down { background: #fff1f2; color: #dc2626; }

/* ═══════════════════════════════════════════════
   CHARTS ROW
═══════════════════════════════════════════════ */
.dsh-charts-row {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 16px;
}

@media (max-width: 1199px) { .dsh-charts-row { grid-template-columns: 1fr; } }

/* ── Generic white card ── */
.dsh-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(15,22,41,0.07);
  border: none;
  overflow: hidden;
}

/* ─── Enquiry Performance card ─── */
.dsh-perf-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 22px 24px 2px;
}

.dsh-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f1629;
  margin: 0 0 14px;
  letter-spacing: -0.2px;
}

.dsh-stats-row {
  display: flex;
  align-items: flex-start;
  gap: 28px;
  flex-wrap: wrap;
}

.dsh-stat-lbl {
  font-size: 0.72rem;
  color: #9ca3af;
  font-weight: 500;
  margin-bottom: 2px;
  letter-spacing: 0;
}

.dsh-stat-val-lg {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f1629;
  line-height: 1;
  letter-spacing: -0.4px;
}

.dsh-stat-val-sm {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f1629;
  line-height: 1;
}

/* ── Timeframe tabs ── */
.dsh-tabs {
  display: flex;
  align-items: center;
  background: #f3f5f9;
  border-radius: 10px;
  padding: 3px;
  gap: 1px;
  flex-shrink: 0;
}

.dsh-tab {
  border: none;
  background: transparent;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #9aa3b0;
  cursor: pointer;
  transition: all 0.14s;
  font-family: inherit !important;
  white-space: nowrap;
}

.dsh-tab.on {
  background: #fff;
  color: #0f1629;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
}

/* ── Legend checklist ── */
.dsh-legend-row {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 8px 24px 8px;
  flex-wrap: wrap;
  border-bottom: 1px solid #f3f5f9;
  margin-bottom: 4px;
}

.dsh-leg-check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.13s;
}

.dsh-leg-check-item:hover { opacity: 0.75; }

.dsh-leg-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border-width: 2.5px;
  border-style: solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}

.dsh-leg-circle-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dsh-leg-text {
  display: flex;
  flex-direction: column;
}

.dsh-leg-name {
  font-size: 0.71rem;
  color: #9aa3b0;
  font-weight: 500;
  line-height: 1.2;
}

.dsh-leg-val {
  font-size: 1rem;
  font-weight: 800;
  color: #0f1629;
  line-height: 1.2;
  letter-spacing: -0.3px;
}

/* ─── Source Breakdown card ─── */
.dsh-src-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 22px 0;
}

.dsh-src-body {
  padding: 0 22px 22px;
}

.dsh-src-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.86rem;
}

.dsh-src-row:last-child { margin-bottom: 0; }

.dsh-src-left {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #4b5563;
  font-weight: 400;
}

.dsh-src-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dsh-src-val {
  font-weight: 700;
  color: #0f1629;
  font-size: 0.9rem;
}

/* ── Small icon button (3 dots) ── */
.dsh-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1.5px solid #e5e9f0;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: background 0.13s;
  padding: 0;
}

.dsh-icon-btn:hover { background: #f5f7fa; }

/* ── Dropdown reset ── */
.dsh .dropdown-toggle::after { display: none !important; }
.dsh .dropdown-toggle:focus  { box-shadow: none !important; outline: none !important; }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────────────────── */
const IcEnquiry = () => (
  <svg width="28" height="30" viewBox="0 0 28 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26.9666 8.96667L20.3 0.633334C20.1447 0.436911 19.9473 0.277976 19.7222 0.168333C19.4972 0.0586894 19.2503 0.00115414 19 0H2.33329C1.89126 0 1.46734 0.175595 1.15478 0.488155C0.842221 0.800716 0.666626 1.22464 0.666626 1.66667V10C0.666626 10.442 0.842221 10.8659 1.15478 11.1785C1.46734 11.4911 1.89126 11.6667 2.33329 11.6667C2.77532 11.6667 3.19924 11.4911 3.5118 11.1785C3.82436 10.8659 3.99996 10.442 3.99996 10V3.33333H15.6666V10C15.6666 10.442 15.8422 10.8659 16.1548 11.1785C16.4673 11.4911 16.8913 11.6667 17.3333 11.6667H24V26.6667H3.99996V18.3333C3.99996 17.8913 3.82436 17.4674 3.5118 17.1548C3.19924 16.8423 2.77532 16.6667 2.33329 16.6667C1.89126 16.6667 1.46734 16.8423 1.15478 17.1548C0.842221 17.4674 0.666626 17.8913 0.666626 18.3333V28.3333C0.666626 28.7754 0.842221 29.1993 1.15478 29.5118C1.46734 29.8244 1.89126 30 2.33329 30H25.6666C26.1086 30 26.5326 29.8244 26.8451 29.5118C27.1577 29.1993 27.3333 28.7754 27.3333 28.3333V10C27.3311 9.62406 27.2019 9.2599 26.9666 8.96667ZM19 4.33333L22.2 8.33333H19V4.33333Z" fill="#3b82f6" />
    <path d="M14 13.3333C13.558 13.3333 13.134 13.5089 12.8215 13.8215C12.5089 14.1341 12.3333 14.558 12.3333 15V16.6667H10.6667C10.2246 16.6667 9.80072 16.8423 9.48816 17.1548C9.1756 17.4674 9 17.8913 9 18.3333C9 18.7754 9.1756 19.1993 9.48816 19.5118C9.80072 19.8244 10.2246 20 10.6667 20H12.3333V21.6667C12.3333 22.1087 12.5089 22.5326 12.8215 22.8452C13.134 23.1577 13.558 23.3333 14 23.3333C14.442 23.3333 14.866 23.1577 15.1785 22.8452C15.4911 22.5326 15.6667 22.1087 15.6667 21.6667V20H17.3333C17.7754 20 18.1993 19.8244 18.5118 19.5118C18.8244 19.1993 19 18.7754 19 18.3333C19 17.8913 18.8244 17.4674 18.5118 17.1548C18.1993 16.8423 17.7754 16.6667 17.3333 16.6667H15.6667V15C15.6667 14.558 15.4911 14.1341 15.1785 13.8215C14.866 13.5089 14.442 13.3333 14 13.3333Z" fill="#3b82f6" />
  </svg>
);

const IcConfirm = () => (
  <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
    <path d="M11 21.5C5.225 21.5 0.5 16.775 0.5 11C0.5 5.225 5.225 0.5 11 0.5C16.775 0.5 21.5 5.225 21.5 11C21.5 16.775 16.775 21.5 11 21.5ZM11 2.6875C6.45 2.6875 2.6875 6.45 2.6875 11C2.6875 15.55 6.45 19.3125 11 19.3125C15.55 19.3125 19.3125 15.55 19.3125 11C19.3125 6.45 15.55 2.6875 11 2.6875Z" fill="#10b981" />
    <path d="M9.3373 15.1126C9.0748 15.1126 8.7248 15.0251 8.5498 14.7626L6.3623 12.5751C5.9248 12.1376 5.9248 11.4376 6.3623 11.0001C6.7998 10.5626 7.4998 10.5626 7.9373 11.0001L9.3373 12.4001L14.0623 7.6751C14.4998 7.2376 15.1998 7.2376 15.6373 7.6751C16.0748 8.1126 16.0748 8.8126 15.6373 9.2501L10.1248 14.7626C9.8623 15.0251 9.5998 15.1126 9.3373 15.1126Z" fill="#10b981" />
  </svg>
);

const IcDoc = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M9 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9l-7-7z" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 3v6h6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="7" y1="15" x2="17" y2="15" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IcAlert = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#ef4444" opacity="0.1" />
    <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.5" fill="none" />
    <line x1="12" y1="7" x2="12" y2="12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="0.8" fill="#ef4444" />
  </svg>
);

const IcCal = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M17 3h4c.55 0 1 .45 1 1v16c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h4V1h2v2h6V1h2v2zM4 9v10h16V9H4zm2 2h2v2H6v-2zm5 0h2v2h-2v-2zm5 0h2v2h-2v-2z" fill="#3b5bdb" />
  </svg>
);

const IcPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z" fill="#fff" />
  </svg>
);

const IcChev = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M7 10l5 5 5-5H7z" fill="#9aa3b0" />
  </svg>
);

const IcDotsH = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="5" cy="12" r="2" fill="#6b7280" />
    <circle cx="12" cy="12" r="2" fill="#6b7280" />
    <circle cx="19" cy="12" r="2" fill="#6b7280" />
  </svg>
);

const IcDotsV = ({ c = "#9ca3af" }) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="4" r="1.8" fill={c} />
    <circle cx="10" cy="10" r="1.8" fill={c} />
    <circle cx="10" cy="16" r="1.8" fill={c} />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */
const KPI_DATA = [
  { num: "45", lbl: "New Enquiries Today", badge: "+12%", up: true, bg: "#eff6ff", Ic: IcEnquiry },
  { num: "28", lbl: "Confirmations Today", badge: "+5%", up: true, bg: "#f0fdf4", Ic: IcConfirm },
  { num: "16", lbl: "Pending Quotations", badge: "-5%", up: false, bg: "#fffbeb", Ic: IcDoc },
  { num: "7", lbl: "Urgent Follow-ups", badge: "+3%", up: true, bg: "#fff1f2", Ic: IcAlert },
];

/* SRC_DATA is now computed dynamically from API data inside Dashboard */
const USER_COLORS = [
  "#1EA7C5", "#2BC844", "#FF9432", "#9568FF",
  "#FF5166", "#6366F1", "#F59E0B", "#EC4899",
  "#14B8A6", "#8B5CF6", "#EF4444", "#3B82F6",
];

/* ─────────────────────────────────────────────────────────────────────────────
   AREA CHART
───────────────────────────────────────────────────────────────────────────── */
const PerfChart = ({ series = [], categories = [] }) => {
  const options = {
    chart: {
      id: "perfChart",
      type: "area",
      height: 280,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      animations: { enabled: true, easing: "easeinout", speed: 700 },
    },
    dataLabels: { enabled: false },
    stroke: { width: [2.5, 2.5, 2.5], curve: "smooth" },
    colors: ["#1EA7C5", "#FF5166", "#9568FF"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.18,
        opacityTo: 0.01,
        stops: [0, 90, 100],
      },
    },
    legend: { show: false },
    markers: {
      size: [5, 5, 5],
      strokeWidth: 3,
      strokeColors: ["#1EA7C5", "#FF5166", "#9568FF"],
      colors: ["#fff", "#fff", "#fff"],
      hover: { size: 7 },
      shape: "circle",
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: "#b0bac9",
          fontSize: "11px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 500,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      tickAmount: 5,
      labels: {
        offsetX: -4,
        style: {
          colors: "#b0bac9",
          fontSize: "11px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 500,
        },
      },
    },
    grid: {
      borderColor: "#edf0f6",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 14, bottom: 0, left: 2 },
    },
    tooltip: {
      shared: true,
      intersect: false,
      style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "12px" },
      theme: "light",
      y: { formatter: (val) => Math.round(val) }
    },
  };

  return (
    <ReactApexChart
      key={`perf-chart-${categories.length}-${series[0]?.data.join(',')}`}
      options={options}
      series={series}
      type="area"
      height={280}
    />
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   DONUT CHART
───────────────────────────────────────────────────────────────────────────── */
const SrcChart = ({ series = [], colors = [], labels = [], totalLabel = "Total", totalValue = "0" }) => {
  const options = {
    chart: {
      type: "donut",
      height: 240,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    dataLabels: { enabled: false },
    stroke: { width: 3, colors: ["#fff"] },
    labels: labels,
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: totalLabel,
              fontSize: "11px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              color: "#8b95a8",
              formatter: () => totalValue,
            },
            value: {
              fontSize: "1.7rem",
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "#0f1629",
              offsetY: 8,
            },
          },
        },
      },
    },
    colors: colors,
    legend: { show: false },
    tooltip: {
      y: { formatter: (v) => v.toLocaleString() },
      style: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    },
  };

  if (!series.length) {
    return <div style={{ textAlign: "center", padding: "40px 0", color: "#9aa3b0", fontSize: "0.85rem" }}>No data available</div>;
  }

  return (
    <ReactApexChart
      key={`src-donut-${totalValue}-${series.length}`}
      options={options}
      series={series}
      type="donut"
      height={240}
    />
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   ENHANCED CONFIRM CARD
───────────────────────────────────────────────────────────────────────────── */
const ConfirmationsCard = () => (
  <div className="card card-box green" style={{ position: 'relative', overflow: 'hidden' }}>
    <div className="back-image">
      <svg width="108" height="84" viewBox="0 0 108 84" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.4">
          <path d="M26.3573 53.0816C-3.53952 45.6892 -21.7583 15.3438 -14.3294 -14.7003C-6.90051 -44.7444 23.3609 -63.1023 53.2577 -55.7099C83.1545 -48.3174 101.373 -17.972 93.9444 12.0721C86.5155 42.1162 56.2541 60.4741 26.3573 53.0816Z" stroke="#1EBA62" />
          <path d="M28.021 46.351C1.8418 39.8777 -14.109 13.2911 -7.59921 -13.036C-1.0894 -39.3632 25.4137 -55.4524 51.5929 -48.9792C77.7722 -42.5059 93.723 -15.9193 87.2132 10.4078C80.7034 36.735 54.2003 52.8242 28.021 46.351Z" stroke="#1EBA62" />
          <path d="M19.6265 51.4174C-6.55274 44.9442 -22.5035 18.3576 -15.9937 -7.96958C-9.48393 -34.2967 17.0191 -50.3859 43.1984 -43.9127C69.3776 -37.4395 85.3284 -10.8529 78.8186 15.4743C72.3088 41.8014 45.8058 57.8906 19.6265 51.4174Z" stroke="#1EBA62" />
          <path d="M10.9723 56.4198C-15.0615 49.9826 -30.8995 23.4265 -24.3891 -2.90312C-17.8787 -29.2328 8.51036 -45.3475 34.5442 -38.9103C60.578 -32.473 76.416 -5.91694 69.9055 20.4127C63.3951 46.7423 37.0061 62.8571 10.9723 56.4198Z" stroke="#1EBA62" />
          <path d="M2.31889 61.4223C-23.8604 54.9491 -39.8112 28.3625 -33.3014 2.0353C-26.7916 -24.2918 -0.288486 -40.3811 25.8908 -33.9078C52.07 -27.4346 68.0208 -0.848004 61.511 25.4792C55.0012 51.8063 28.4981 67.8955 2.31889 61.4223Z" stroke="#1EBA62" />
          <path d="M-6.33532 66.4247C-32.3691 59.9874 -48.2071 33.4313 -41.6967 7.1017C-35.1863 -19.2279 -8.79725 -35.3427 17.2365 -28.9054C43.2704 -22.4682 59.1083 4.08788 52.5979 30.4175C46.0875 56.7472 19.6985 72.8619 -6.33532 66.4247Z" stroke="#1EBA62" />
          <circle cx="-3.26671" cy="24.0209" r="48.8339" transform="rotate(103.889 -3.26671 24.0209)" stroke="#1EBA62" />
        </g>
      </svg>
    </div>
    <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap" style={{ position: 'relative', zIndex: 2 }}>
      <div className="d-flex align-items-center">
        <div className="card-box-icon me-2">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 21.5C5.225 21.5 0.5 16.775 0.5 11C0.5 5.225 5.225 0.5 11 0.5C16.775 0.5 21.5 5.225 21.5 11C21.5 16.775 16.775 21.5 11 21.5ZM11 2.6875C6.45 2.6875 2.6875 6.45 2.6875 11C2.6875 15.55 6.45 19.3125 11 19.3125C15.55 19.3125 19.3125 15.55 19.3125 11C19.3125 6.45 15.55 2.6875 11 2.6875Z" fill="#FCFCFC" />
            <path d="M9.3373 15.1126C9.0748 15.1126 8.7248 15.0251 8.5498 14.7626L6.3623 12.5751C5.9248 12.1376 5.9248 11.4376 6.3623 11.0001C6.7998 10.5626 7.4998 10.5626 7.9373 11.0001L9.3373 12.4001L14.0623 7.6751C14.4998 7.2376 15.1998 7.2376 15.6373 7.6751C16.0748 8.1126 16.0748 8.8126 15.6373 9.2501L10.1248 14.7626C9.8623 15.0251 9.5998 15.1126 9.3373 15.1126Z" fill="#FCFCFC" />
          </svg>
        </div>
        <div>
          <h4 className="fs-15 font-w600 mb-0">
            Confirmations
            <br /> Today
          </h4>
          <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#8b95a8', fontWeight: '500' }}>+5% vs last week</div>
        </div>
      </div>
      <div className="chart-num" style={{ textAlign: 'center' }}>
        <h2 className="font-w600 mb-0 fs-28">28</h2>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   URGENT FOLLOWUPS CARD
───────────────────────────────────────────────────────────────────────────── */
const UrgentFollowupsCard = () => (
  <div className="card card-box red" style={{ position: 'relative', overflow: 'hidden' }}>
    <div className="back-image">
      <svg width="108" height="84" viewBox="0 0 108 84" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.4">
          <path d="M26.3573 53.0816C-3.53952 45.6892 -21.7583 15.3438 -14.3294 -14.7003C-6.90051 -44.7444 23.3609 -63.1023 53.2577 -55.7099C83.1545 -48.3174 101.373 -17.972 93.9444 12.0721C86.5155 42.1162 56.2541 60.4741 26.3573 53.0816Z" stroke="#ef4444" />
          <path d="M28.021 46.351C1.8418 39.8777 -14.109 13.2911 -7.59921 -13.036C-1.0894 -39.3632 25.4137 -55.4524 51.5929 -48.9792C77.7722 -42.5059 93.723 -15.9193 87.2132 10.4078C80.7034 36.735 54.2003 52.8242 28.021 46.351Z" stroke="#ef4444" />
          <path d="M19.6265 51.4174C-6.55274 44.9442 -22.5035 18.3576 -15.9937 -7.96958C-9.48393 -34.2967 17.0191 -50.3859 43.1984 -43.9127C69.3776 -37.4395 85.3284 -10.8529 78.8186 15.4743C72.3088 41.8014 45.8058 57.8906 19.6265 51.4174Z" stroke="#ef4444" />
          <path d="M10.9723 56.4198C-15.0615 49.9826 -30.8995 23.4265 -24.3891 -2.90312C-17.8787 -29.2328 8.51036 -45.3475 34.5442 -38.9103C60.578 -32.473 76.416 -5.91694 69.9055 20.4127C63.3951 46.7423 37.0061 62.8571 10.9723 56.4198Z" stroke="#ef4444" />
          <path d="M2.31889 61.4223C-23.8604 54.9491 -39.8112 28.3625 -33.3014 2.0353C-26.7916 -24.2918 -0.288486 -40.3811 25.8908 -33.9078C52.07 -27.4346 68.0208 -0.848004 61.511 25.4792C55.0012 51.8063 28.4981 67.8955 2.31889 61.4223Z" stroke="#ef4444" />
          <path d="M-6.33532 66.4247C-32.3691 59.9874 -48.2071 33.4313 -41.6967 7.1017C-35.1863 -19.2279 -8.79725 -35.3427 17.2365 -28.9054C43.2704 -22.4682 59.1083 4.08788 52.5979 30.4175C46.0875 56.7472 19.6985 72.8619 -6.33532 66.4247Z" stroke="#ef4444" />
          <circle cx="-3.26671" cy="24.0209" r="48.8339" transform="rotate(103.889 -3.26671 24.0209)" stroke="#ef4444" />
        </g>
      </svg>
    </div>
    <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap" style={{ position: 'relative', zIndex: 2 }}>
      <div className="d-flex align-items-center">
        <div className="card-box-icon me-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 3.5C11.9233 3.5 9.89324 4.11582 8.16652 5.26957C6.43981 6.42333 5.09399 8.06321 4.29927 9.98184C3.50455 11.9005 3.29661 14.0117 3.70176 16.0485C4.10691 18.0853 5.10693 19.9562 6.57539 21.4247C8.04384 22.8931 9.91477 23.8931 11.9516 24.2983C13.9884 24.7034 16.0996 24.4955 18.0182 23.7008C19.9368 22.9061 21.5767 21.5602 22.7305 19.8335C23.8842 18.1068 24.5 16.0767 24.5 14C24.5 12.6211 24.2284 11.2558 23.7008 9.98184C23.1731 8.70791 22.3997 7.5504 21.4247 6.57538C20.4496 5.60037 19.2921 4.82694 18.0182 4.29927C16.7443 3.77159 15.3789 3.5 14 3.5ZM14 22.4C12.3387 22.4 10.7146 21.9074 9.33322 20.9844C7.95185 20.0614 6.8752 18.7495 6.23942 17.2146C5.60364 15.6797 5.4373 13.9907 5.76141 12.3613C6.08553 10.7318 6.88555 9.23507 8.06032 8.06031C9.23508 6.88555 10.7318 6.08552 12.3613 5.76141C13.9907 5.43729 15.6797 5.60364 17.2146 6.23942C18.7495 6.87519 20.0614 7.95185 20.9844 9.33322C21.9074 10.7146 22.4 12.3387 22.4 14C22.4 16.2278 21.515 18.3644 19.9397 19.9397C18.3644 21.515 16.2278 22.4 14 22.4Z" fill="#FCFCFC" />
            <path d="M13.9998 8.75006C13.7214 8.75006 13.4543 8.86069 13.2574 9.0576C13.0605 9.25451 12.9498 9.52158 12.9498 9.80006V15.0501C12.9498 15.3285 13.0605 15.5956 13.2574 15.7925C13.4543 15.9894 13.7214 16.1001 13.9998 16.1001C14.2783 16.1001 14.5454 15.9894 14.7423 15.7925C14.9392 15.5956 15.0498 15.3285 15.0498 15.0501V9.80006C15.0498 9.52158 14.9392 9.25451 14.7423 9.0576C14.5454 8.86069 14.2783 8.75006 13.9998 8.75006ZM14.7453 17.4756L14.5878 17.3391L14.3988 17.2446L14.1993 17.1501C14.0298 17.1176 13.8549 17.1275 13.69 17.1788C13.5252 17.23 13.3755 17.3212 13.2543 17.4441C13.1599 17.5408 13.085 17.6549 13.0338 17.7801C12.9733 17.9116 12.9446 18.0554 12.9498 18.2001C12.951 18.4755 13.0604 18.7395 13.2543 18.9351C13.3561 19.0309 13.4732 19.109 13.6008 19.1661C13.7265 19.2216 13.8624 19.2503 13.9998 19.2503C14.1373 19.2503 14.2732 19.2216 14.3988 19.1661C14.5264 19.109 14.6436 19.0309 14.7453 18.9351C14.9393 18.7395 15.0487 18.4755 15.0498 18.2001C15.0496 18.0593 15.021 17.9201 14.9658 17.7906C14.9124 17.6729 14.8376 17.5661 14.7453 17.4756Z" fill="#FCFCFC" />
          </svg>
        </div>
        <div>
          <h4 className="fs-15 font-w600 mb-0">
            Urgent
            <br /> Follow-ups
          </h4>
          <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#8b95a8', fontWeight: '500' }}>+3% needs attention</div>
        </div>
      </div>
      <div className="chart-num" style={{ textAlign: 'center' }}>
        <h2 className="font-w600 mb-0 fs-28">7</h2>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   TOTAL QUERIES CARD
───────────────────────────────────────────────────────────────────────────── */
const TotalQueriesCard = () => (
  <div className="card card-box blue" style={{ position: 'relative', overflow: 'hidden' }}>
    <div className="back-image">
      <svg width="108" height="84" viewBox="0 0 108 84" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.4">
          <path d="M26.3573 53.0816C-3.53952 45.6892 -21.7583 15.3438 -14.3294 -14.7003C-6.90051 -44.7444 23.3609 -63.1023 53.2577 -55.7099C83.1545 -48.3174 101.373 -17.972 93.9444 12.0721C86.5155 42.1162 56.2541 60.4741 26.3573 53.0816Z" stroke="#3b82f6" />
          <path d="M28.021 46.351C1.8418 39.8777 -14.109 13.2911 -7.59921 -13.036C-1.0894 -39.3632 25.4137 -55.4524 51.5929 -48.9792C77.7722 -42.5059 93.723 -15.9193 87.2132 10.4078C80.7034 36.735 54.2003 52.8242 28.021 46.351Z" stroke="#3b82f6" />
          <path d="M19.6265 51.4174C-6.55274 44.9442 -22.5035 18.3576 -15.9937 -7.96958C-9.48393 -34.2967 17.0191 -50.3859 43.1984 -43.9127C69.3776 -37.4395 85.3284 -10.8529 78.8186 15.4743C72.3088 41.8014 45.8058 57.8906 19.6265 51.4174Z" stroke="#3b82f6" />
          <path d="M10.9723 56.4198C-15.0615 49.9826 -30.8995 23.4265 -24.3891 -2.90312C-17.8787 -29.2328 8.51036 -45.3475 34.5442 -38.9103C60.578 -32.473 76.416 -5.91694 69.9055 20.4127C63.3951 46.7423 37.0061 62.8571 10.9723 56.4198Z" stroke="#3b82f6" />
          <path d="M2.31889 61.4223C-23.8604 54.9491 -39.8112 28.3625 -33.3014 2.0353C-26.7916 -24.2918 -0.288486 -40.3811 25.8908 -33.9078C52.07 -27.4346 68.0208 -0.848004 61.511 25.4792C55.0012 51.8063 28.4981 67.8955 2.31889 61.4223Z" stroke="#3b82f6" />
          <path d="M-6.33532 66.4247C-32.3691 59.9874 -48.2071 33.4313 -41.6967 7.1017C-35.1863 -19.2279 -8.79725 -35.3427 17.2365 -28.9054C43.2704 -22.4682 59.1083 4.08788 52.5979 30.4175C46.0875 56.7472 19.6985 72.8619 -6.33532 66.4247Z" stroke="#3b82f6" />
          <circle cx="-3.26671" cy="24.0209" r="48.8339" transform="rotate(103.889 -3.26671 24.0209)" stroke="#3b82f6" />
        </g>
      </svg>
    </div>
    <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap" style={{ position: 'relative', zIndex: 2 }}>
      <div className="d-flex align-items-center">
        <div className="card-box-icon me-2">
          <svg width="22" height="22" viewBox="0 0 28 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26.9666 8.96667L20.3 0.633334C20.1447 0.436911 19.9473 0.277976 19.7222 0.168333C19.4972 0.0586894 19.2503 0.00115414 19 0H2.33329C1.89126 0 1.46734 0.175595 1.15478 0.488155C0.842221 0.800716 0.666626 1.22464 0.666626 1.66667V10C0.666626 10.442 0.842221 10.8659 1.15478 11.1785C1.46734 11.4911 1.89126 11.6667 2.33329 11.6667C2.77532 11.6667 3.19924 11.4911 3.5118 11.1785C3.82436 10.8659 3.99996 10.442 3.99996 10V3.33333H15.6666V10C15.6666 10.442 15.8422 10.8659 16.1548 11.1785C16.4673 11.4911 16.8913 11.6667 17.3333 11.6667H24V26.6667H3.99996V18.3333C3.99996 17.8913 3.82436 17.4674 3.5118 17.1548C3.19924 16.8423 2.77532 16.6667 2.33329 16.6667C1.89126 16.6667 1.46734 16.8423 1.15478 17.1548C0.842221 17.4674 0.666626 17.8913 0.666626 18.3333V28.3333C0.666626 28.7754 0.842221 29.1993 1.15478 29.5118C1.46734 29.8244 1.89126 30 2.33329 30H25.6666C26.1086 30 26.5326 29.8244 26.8451 29.5118C27.1577 29.1993 27.3333 28.7754 27.3333 28.3333V10C27.3311 9.62406 27.2019 9.2599 26.9666 8.96667ZM19 4.33333L22.2 8.33333H19V4.33333Z" fill="#FCFCFC" />
            <path d="M14 13.3333C13.558 13.3333 13.134 13.5089 12.8215 13.8215C12.5089 14.1341 12.3333 14.558 12.3333 15V16.6667H10.6667C10.2246 16.6667 9.80072 16.8423 9.48816 17.1548C9.1756 17.4674 9 17.8913 9 18.3333C9 18.7754 9.1756 19.1993 9.48816 19.5118C9.80072 19.8244 10.2246 20 10.6667 20H12.3333V21.6667C12.3333 22.1087 12.5089 22.5326 12.8215 22.8452C13.134 23.1577 13.558 23.3333 14 23.3333C14.442 23.3333 14.866 23.1577 15.1785 22.8452C15.4911 22.5326 15.6667 22.1087 15.6667 21.6667V20H17.3333C17.7754 20 18.1993 19.8244 18.5118 19.5118C18.8244 19.1993 19 18.7754 19 18.3333C19 17.8913 18.8244 17.4674 18.5118 17.1548C18.1993 16.8423 17.7754 16.6667 17.3333 16.6667H15.6667V15C15.6667 14.558 15.4911 14.1341 15.1785 13.8215C14.866 13.5089 14.442 13.3333 14 13.3333Z" fill="#FCFCFC" />
          </svg>
        </div>
        <div>
          <h4 className="fs-15 font-w600 mb-0">
            New Enquiries
            <br /> Today
          </h4>
          <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#8b95a8', fontWeight: '500' }}>New</div>
        </div>
      </div>
      <div className="chart-num" style={{ textAlign: 'center' }}>
        <h2 className="font-w600 mb-0 fs-28">45</h2>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   PENDING QUOTATIONS CARD
───────────────────────────────────────────────────────────────────────────── */
const PendingQuotationsCard = () => (
  <div className="card card-box amber" style={{ position: 'relative', overflow: 'hidden' }}>
    <div className="back-image">
      <svg width="108" height="84" viewBox="0 0 108 84" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.4">
          <path d="M26.3573 53.0816C-3.53952 45.6892 -21.7583 15.3438 -14.3294 -14.7003C-6.90051 -44.7444 23.3609 -63.1023 53.2577 -55.7099C83.1545 -48.3174 101.373 -17.972 93.9444 12.0721C86.5155 42.1162 56.2541 60.4741 26.3573 53.0816Z" stroke="#f59e0b" />
          <path d="M28.021 46.351C1.8418 39.8777 -14.109 13.2911 -7.59921 -13.036C-1.0894 -39.3632 25.4137 -55.4524 51.5929 -48.9792C77.7722 -42.5059 93.723 -15.9193 87.2132 10.4078C80.7034 36.735 54.2003 52.8242 28.021 46.351Z" stroke="#f59e0b" />
          <path d="M19.6265 51.4174C-6.55274 44.9442 -22.5035 18.3576 -15.9937 -7.96958C-9.48393 -34.2967 17.0191 -50.3859 43.1984 -43.9127C69.3776 -37.4395 85.3284 -10.8529 78.8186 15.4743C72.3088 41.8014 45.8058 57.8906 19.6265 51.4174Z" stroke="#f59e0b" />
          <path d="M10.9723 56.4198C-15.0615 49.9826 -30.8995 23.4265 -24.3891 -2.90312C-17.8787 -29.2328 8.51036 -45.3475 34.5442 -38.9103C60.578 -32.473 76.416 -5.91694 69.9055 20.4127C63.3951 46.7423 37.0061 62.8571 10.9723 56.4198Z" stroke="#f59e0b" />
          <path d="M2.31889 61.4223C-23.8604 54.9491 -39.8112 28.3625 -33.3014 2.0353C-26.7916 -24.2918 -0.288486 -40.3811 25.8908 -33.9078C52.07 -27.4346 68.0208 -0.848004 61.511 25.4792C55.0012 51.8063 28.4981 67.8955 2.31889 61.4223Z" stroke="#f59e0b" />
          <path d="M-6.33532 66.4247C-32.3691 59.9874 -48.2071 33.4313 -41.6967 7.1017C-35.1863 -19.2279 -8.79725 -35.3427 17.2365 -28.9054C43.2704 -22.4682 59.1083 4.08788 52.5979 30.4175C46.0875 56.7472 19.6985 72.8619 -6.33532 66.4247Z" stroke="#f59e0b" />
          <circle cx="-3.26671" cy="24.0209" r="48.8339" transform="rotate(103.889 -3.26671 24.0209)" stroke="#f59e0b" />
        </g>
      </svg>
    </div>
    <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap" style={{ position: 'relative', zIndex: 2 }}>
      <div className="d-flex align-items-center">
        <div className="card-box-icon me-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9l-7-7z" stroke="#FCFCFC" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 3v6h6" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="7" y1="15" x2="17" y2="15" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h4 className="fs-15 font-w600 mb-0">
            Pending
            <br /> Quotations
          </h4>
          <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#8b95a8', fontWeight: '500' }}>Awaiting response</div>
        </div>
      </div>
      <div className="chart-num" style={{ textAlign: 'center' }}>
        <h2 className="font-w600 mb-0 fs-28">16</h2>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   SMALL REUSABLE
───────────────────────────────────────────────────────────────────────────── */
const CardDotBtn = ({ onRefresh }) => (
  <Dropdown>
    <Dropdown.Toggle as="div" className="dsh-icon-btn" style={{ cursor: "pointer" }}>
      <IcDotsV />
    </Dropdown.Toggle>
    <Dropdown.Menu className="dropdown-menu-end">
      <Dropdown.Item onClick={(e) => { e.preventDefault(); if (onRefresh) onRefresh(); }}>Refresh</Dropdown.Item>
      <Dropdown.Item href="#">Download</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [tab, setTab] = useState("This Week");
  const [srcRefresh, setSrcRefresh] = useState(0);

  /* ── Fetch user list and enquiry list for Source Breakdown ── */
  const usersResponse = useAsync(`${URLS.USER_GET_URL}?_t=${srcRefresh}`);
  const enquiryResponse = useAsync(`${URLS.ENQUIRY_URL}?_t=${srcRefresh}`);

  const userPerformance = useMemo(() => {
    const users = usersResponse?.data?.data?.data || usersResponse?.data?.data || [];
    const enquiries = enquiryResponse?.data?.data || [];

    if (!users.length) return { srcData: [], series: [], colors: [], labels: [], total: 0 };

    const srcData = users.map((user, idx) => {
      const count = enquiries.filter(
        (e) => e.assigned_to_user?.id === user.id
      ).length;
      return {
        color: USER_COLORS[idx % USER_COLORS.length],
        label: user.first_name || user.username || `User ${user.id}`,
        val: count.toLocaleString(),
        numVal: count,
      };
    });

    const total = enquiries.length;
    const series = srcData.map((s) => s.numVal);
    const colors = srcData.map((s) => s.color);
    const labels = srcData.map((s) => s.label);

    return { srcData, series, colors, labels, total };
  }, [usersResponse?.data, enquiryResponse?.data]);

  /* ── Dynamic calculation for Enquiry Performance (Area Chart & Legend) ── */
  const perfData = useMemo(() => {
    const enquiries = enquiryResponse?.data?.data || [];
    const now = new Date();

    // Group definitions
    let categories = [];
    let groupKeyFn = () => 0; // returns index in category array

    if (tab === "This Week") {
      categories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const startOfWeek = new Date(now);
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0 is Monday
      startOfWeek.setDate(now.getDate() - day);
      startOfWeek.setHours(0, 0, 0, 0);

      groupKeyFn = (date) => {
        if (date < startOfWeek) return -1;
        const diffInt = Math.floor((date - startOfWeek) / (1000 * 60 * 60 * 24));
        return (diffInt >= 0 && diffInt <= 6) ? diffInt : -1;
      };
    } else if (tab === "This Month") {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const numWeeks = Math.ceil(daysInMonth / 7);
      categories = Array.from({ length: numWeeks }, (_, i) => `Week ${i + 1}`);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      groupKeyFn = (date) => {
        if (date < startOfMonth || date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return -1;
        const dayOfMonth = date.getDate();
        const weekIdx = Math.floor((dayOfMonth - 1) / 7);
        return Object.hasOwn(categories, weekIdx) ? weekIdx : -1;
      };
    } else if (tab === "This Quarter") {
      const quarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      categories = [monthNames[quarter * 3], monthNames[quarter * 3 + 1], monthNames[quarter * 3 + 2]];

      groupKeyFn = (date) => {
        if (date < startOfQuarter || date.getFullYear() !== now.getFullYear()) return -1;
        const qIdx = date.getMonth() - (quarter * 3);
        return (qIdx >= 0 && qIdx <= 2) ? qIdx : -1;
      };
    } else if (tab === "This Year") {
      categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      groupKeyFn = (date) => {
        if (date < startOfYear || date.getFullYear() !== now.getFullYear()) return -1;
        return date.getMonth();
      };
    }

    // Initialize data arrays
    const confData = new Array(categories.length).fill(0);
    const cancData = new Array(categories.length).fill(0);
    const pendData = new Array(categories.length).fill(0);

    // Totals for legend
    let totalConfirmed = 0;
    let totalCancelled = 0;
    let totalPending = 0;
    let totalEnquiries = 0;

    enquiries.forEach((item) => {
      // Find the status bucket
      const statusRaw = String(item?.status || item?.enquiry_status || item?.current_status || item?.lead_status || "").toLowerCase();
      let isConfirmed = statusRaw.includes("confirm");
      let isCancelled = statusRaw.includes("cancel");
      let isPending = !isConfirmed && !isCancelled;

      // Find date
      const dateStr = item?.start_date || item?.created_at;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.valueOf())) return;

      const idx = groupKeyFn(d);
      if (idx !== -1) {
        totalEnquiries++;
        if (isConfirmed) { confData[idx]++; totalConfirmed++; }
        else if (isCancelled) { cancData[idx]++; totalCancelled++; }
        else { pendData[idx]++; totalPending++; }
      }
    });

    // Ensure chart looks nice if everything is 0 by creating a baseline if needed, but Apex is fine with 0s.
    const series = [
      { name: "Confirmed", data: confData },
      { name: "Cancelled", data: cancData },
      { name: "Pending", data: pendData },
    ];

    const chartLegs = [
      { color: "#6366f1", label: "Total", value: totalEnquiries.toLocaleString(), seriesName: null },
      { color: "#1EA7C5", label: "Confirmed", value: totalConfirmed.toLocaleString(), seriesName: "Confirmed" },
      { color: "#FF5166", label: "Cancelled", value: totalCancelled.toLocaleString(), seriesName: "Cancelled" },
      { color: "#9568FF", label: "Pending", value: totalPending.toLocaleString(), seriesName: "Pending" },
    ];

    return { series, categories, chartLegs };
  }, [enquiryResponse?.data, tab]);

  /* checkedItems: Total ON by default, others OFF */
  const [checkedItems, setCheckedItems] = useState({
    "Total": true,
    "Confirmed": false,
    "Cancelled": false,
    "Pending": false,
  });

  const handleCheckChange = (label) => {
    // Total is not clickable — it auto-manages itself
    if (label === "Total") return;

    setCheckedItems(prev => {
      const newState = { ...prev, [label]: !prev[label] };

      // After toggle, if NO series item is checked → restore Total
      const anySeriesChecked =
        newState["Confirmed"] || newState["Cancelled"] || newState["Pending"];
      newState["Total"] = !anySeriesChecked;

      return newState;
    });

    const leg = CHART_LEGS.find(l => l.label === label);
    if (leg?.seriesName) {
      ApexCharts.exec("perfChart", "toggleSeries", leg.seriesName);
    }
  };

  return (
    <>
      {/* Style injection */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="dsh">

        {/* ── HEADER ── */}
        <div className="dsh-hdr">
          <div className="dsh-hdr-left">
            <h2 className="dsh-title">Dashboard</h2>
            <p className="dsh-subtitle">B2B Travel Operations Overview</p>
          </div>

          <div className="dsh-hdr-right">
            <div className="dsh-date-pill">
              <IcCal />
              <div className="dsh-dp">
                <DatePicker
                  selected={startDate}
                  onChange={(d) => d && setStartDate(d)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={endDate}
                  dateFormat="MMM d, yyyy"
                />
              </div>
              <span className="dsh-date-sep">-</span>
              <div className="dsh-dp">
                <DatePicker
                  selected={endDate}
                  onChange={(d) => d && setEndDate(d)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  dateFormat="MMM d, yyyy"
                />
              </div>
              <span className="dsh-date-chevron"><IcChev /></span>
            </div>

            <button className="dsh-cta">
              <IcPlus /> New Enquiry
            </button>

            <Dropdown>
              <Dropdown.Toggle as="button" className="dsh-dots-btn">
                <IcDotsH />
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-end">
                <Dropdown.Item href="#">Refresh</Dropdown.Item>
                <Dropdown.Item href="#">Export</Dropdown.Item>
                <Dropdown.Item href="#">Settings</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "0 28px 40px" }}>

          {/* KPI CARDS */}
          <div className="dsh-kpi-row">
            <TotalQueriesCard />
            <PendingQuotationsCard />
            <UrgentFollowupsCard />
            <ConfirmationsCard />
          </div>

          {/* CHARTS ROW */}
          <div className="dsh-charts-row">

            {/* LEFT: Enquiry Performance */}
            <div className="dsh-card">
              <div className="dsh-perf-head">
                <div>
                  <div className="dsh-card-title">Enquiry Performance</div>
                </div>

                {/* Timeframe tabs */}
                <div className="dsh-tabs">
                  {["This Week", "This Month", "This Quarter", "This Year"].map((t) => (
                    <button
                      key={t}
                      className={`dsh-tab${tab === t ? " on" : ""}`}
                      onClick={() => setTab(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── 4-item checklist legend ── */}
              <div className="dsh-legend-row" style={{ minHeight: "45px" }}>
                {perfData.chartLegs.map((l) => {
                  const isChecked = checkedItems[l.label];
                  return (
                    <div
                      key={l.label}
                      className="dsh-leg-check-item"
                      onClick={() => handleCheckChange(l.label)}
                    >
                      {/* Circle checkbox */}
                      <div
                        className="dsh-leg-circle"
                        style={{
                          borderColor: l.color,
                          background: isChecked ? l.color + "22" : "transparent",
                        }}
                      >
                        {isChecked && (
                          <div
                            className="dsh-leg-circle-inner"
                            style={{ background: l.color }}
                          />
                        )}
                      </div>

                      {/* Label + value */}
                      <div className="dsh-leg-text">
                        <span className="dsh-leg-name">{l.label}</span>
                        <span className="dsh-leg-val">{l.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart */}
              <div style={{ padding: "0 6px 4px", minHeight: "280px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {enquiryResponse.loading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#3B82F6" }}>
                    <div className="spinner-border" role="status" style={{ width: "2.5rem", height: "2.5rem", borderWidth: "3px" }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <PerfChart series={perfData.series} categories={perfData.categories} />
                )}
              </div>
            </div>

            {/* RIGHT: Source Breakdown */}
            <div className="dsh-card">
              <div className="dsh-src-head">
                <span className="dsh-card-title" style={{ marginBottom: 0 }}>
                  Source Breakdown
                </span>
                <CardDotBtn onRefresh={() => setSrcRefresh(Date.now())} />
              </div>

              <div className="dsh-src-body" style={{ minHeight: "300px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {(usersResponse.loading || enquiryResponse.loading) ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#3B82F6" }}>
                    <div className="spinner-border" role="status" style={{ width: "2.5rem", height: "2.5rem", borderWidth: "3px" }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <span style={{ marginTop: "12px", fontSize: "14px", fontWeight: 500, color: "#64748b" }}>Refreshing data...</span>
                  </div>
                ) : (
                  <>
                    <SrcChart
                      series={userPerformance.series}
                      colors={userPerformance.colors}
                      labels={userPerformance.labels}
                      totalLabel="Total Enquiries"
                      totalValue={userPerformance.total.toLocaleString()}
                    />
                    <div style={{ marginTop: 6 }}>
                      {userPerformance.srcData.map((s) => (
                        <div key={s.label} className="dsh-src-row">
                          <div className="dsh-src-left">
                            <span className="dsh-src-dot" style={{ background: s.color }} />
                            {s.label}
                          </div>
                          <span className="dsh-src-val">{s.val}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>{/* end charts row */}
        </div>{/* end content */}

      </div>{/* end dsh */}
    </>
  );
};

export default Dashboard;