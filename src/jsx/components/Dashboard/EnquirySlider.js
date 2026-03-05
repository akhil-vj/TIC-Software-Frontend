import React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

import { Autoplay } from "swiper";

const arr = [
    { name: "Total", value: "3,932" },
    { name: "Confirmed", value: "2,654" },
    { name: "Follow up", value: "1,932" },
    { name: "Sent", value: "2,432" },
];

const formatNumber = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) {
        return value || "0";
    }
    return new Intl.NumberFormat("en-IN").format(num);
};

const getIcon = (index) => {
    switch (index) {
        case 0:
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            );
        case 1:
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            );
        case 2:
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            );
        default:
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            );
    }
};

const getBgColorClass = (index) => {
    const colors = ["blue", "green", "secondary", "pink"];
    return colors[index % colors.length];
};

export default function EnquirySlider({ title = "Enquiry", array = arr }) {
    const data = Array.isArray(array) && array.length ? array : arr;

    return (
        <>
            <Swiper
                className="overflow-hidden"
                speed={1500}
                parallax={true}
                slidesPerView={4}
                spaceBetween={20}
                loop={false}
                modules={[Autoplay]}
                breakpoints={{
                    300: { slidesPerView: 1 },
                    576: { slidesPerView: 2 },
                    991: { slidesPerView: 3 },
                    1200: { slidesPerView: 4 },
                    1600: { slidesPerView: 4 },
                }}
            >
                {data.map((item, index) => (
                    <SwiperSlide key={index}>
                        <div className={`card card-box ${getBgColorClass(index)}`}>
                            <div className="back-image">
                                <svg
                                    width="108"
                                    height="84"
                                    viewBox="0 0 108 84"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g opacity="0.4">
                                        <path d="M26.3573 53.0816C-3.53952 45.6892 -21.7583 15.3438 -14.3294 -14.7003C-6.90051 -44.7444 23.3609 -63.1023 53.2577 -55.7099C83.1545 -48.3174 101.373 -17.972 93.9444 12.0721C86.5155 42.1162 56.2541 60.4741 26.3573 53.0816Z" stroke="#01A3FF" />
                                        <path d="M28.021 46.351C1.8418 39.8777 -14.109 13.2911 -7.59921 -13.036C-1.0894 -39.3632 25.4137 -55.4524 51.5929 -48.9792C77.7722 -42.5059 93.723 -15.9193 87.2132 10.4078C80.7034 36.735 54.2003 52.8242 28.021 46.351Z" stroke="#01A3FF" />
                                        <path d="M19.6265 51.4174C-6.55274 44.9442 -22.5035 18.3576 -15.9937 -7.96958C-9.48393 -34.2967 17.0191 -50.3859 43.1984 -43.9127C69.3776 -37.4395 85.3284 -10.8529 78.8186 15.4743C72.3088 41.8014 45.8058 57.8906 19.6265 51.4174Z" stroke="#01A3FF" />
                                        <path d="M10.9723 56.4198C-15.0615 49.9826 -30.8995 23.4265 -24.3891 -2.90312C-17.8787 -29.2328 8.51036 -45.3475 34.5442 -38.9103C60.578 -32.473 76.416 -5.91694 69.9055 20.4127C63.3951 46.7423 37.0061 62.8571 10.9723 56.4198Z" stroke="#01A3FF" />
                                        <path d="M2.31889 61.4223C-23.8604 54.9491 -39.8112 28.3625 -33.3014 2.0353C-26.7916 -24.2918 -0.288486 -40.3811 25.8908 -33.9078C52.07 -27.4346 68.0208 -0.848004 61.511 25.4792C55.0012 51.8063 28.4981 67.8955 2.31889 61.4223Z" stroke="#01A3FF" />
                                        <path d="M-6.33532 66.4247C-32.3691 59.9874 -48.2071 33.4313 -41.6967 7.1017C-35.1863 -19.2279 -8.79725 -35.3427 17.2365 -28.9054C43.2704 -22.4682 59.1083 4.08788 52.5979 30.4175C46.0875 56.7472 19.6985 72.8619 -6.33532 66.4247Z" stroke="#01A3FF" />
                                        <circle cx="-3.26671" cy="24.0209" r="48.8339" transform="rotate(103.889 -3.26671 24.0209)" stroke="#01A3FF" />
                                    </g>
                                </svg>
                            </div>
                            <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap">
                                <div className="d-flex align-items-center">
                                    <div className="card-box-icon me-2">
                                        {getIcon(index)}
                                    </div>
                                    <div>
                                        <h4 className="fs-15 font-w600 mb-0">
                                            {item.name}
                                            <br />
                                            {title}
                                        </h4>
                                    </div>
                                </div>
                                <div className="chart-num">
                                    <h2 className="font-w600 mb-0 fs-28">{formatNumber(item.value)}</h2>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    );
}
