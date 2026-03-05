import React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

//import "swiper/css";

import { Autoplay } from "swiper";

const sliderData = [
  { title: "Ticket Solid", change: "blue", number: "546" },
  { title: "Ticket Refund", change: "secondary", number: "349" },
  { title: "Canceled", change: "pink", number: "980" },
  { title: "Rescheduled", change: "black", number: "720" },
];

export default function TicketingSlider() {
  return (
    <>
      <Swiper
        className="ticketing-Swiper position-relative overflow-hidden"
        speed={1500}
        parallax={true}
        slidesPerView={4}
        spaceBetween={30}
        loop={false}
        modules={[Autoplay]}
        breakpoints={{
          300: {
            slidesPerView: 1,
            spaceBetween: 30,
          },
          576: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          991: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1200: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1600: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
        }}
      >
        {sliderData.map((d, i) => (
          <SwiperSlide key={i}>
            <div className={`card ticket ${d.change}`}>
              <div className="back-image">
                <svg
                  width="102"
                  height="100"
                  viewBox="0 0 102 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g opacity="0.3">
                    <path
                      d="M89.3573 123.082C59.4605 115.689 41.2417 85.3438 48.6706 55.2997C56.0995 25.2556 86.3609 6.89766 116.258 14.2901C146.155 21.6826 164.373 52.028 156.944 82.0721C149.516 112.116 119.254 130.474 89.3573 123.082Z"
                      stroke="white"
                    />
                    <path
                      d="M91.021 116.351C64.8418 109.878 48.891 83.2911 55.4008 56.964C61.9106 30.6368 88.4137 14.5476 114.593 21.0208C140.772 27.4941 156.723 54.0807 150.213 80.4078C143.703 106.735 117.2 122.824 91.021 116.351Z"
                      stroke="white"
                    />
                    <path
                      d="M82.6265 121.417C56.4473 114.944 40.4965 88.3576 47.0063 62.0304C53.5161 35.7033 80.0191 19.6141 106.198 26.0873C132.378 32.5605 148.328 59.1471 141.819 85.4743C135.309 111.801 108.806 127.891 82.6265 121.417Z"
                      stroke="white"
                    />
                    <path
                      d="M73.9723 126.42C47.9385 119.983 32.1005 93.4265 38.6109 67.0969C45.1213 40.7672 71.5104 24.6525 97.5442 31.0897C123.578 37.527 139.416 64.0831 132.906 90.4127C126.395 116.742 100.006 132.857 73.9723 126.42Z"
                      stroke="white"
                    />
                    <path
                      d="M65.3189 131.422C39.1396 124.949 23.1888 98.3625 29.6986 72.0353C36.2084 45.7082 62.7115 29.6189 88.8908 36.0922C115.07 42.5654 131.021 69.152 124.511 95.4792C118.001 121.806 91.4981 137.896 65.3189 131.422Z"
                      stroke="white"
                    />
                    <path
                      d="M56.6647 136.425C30.6309 129.987 14.7929 103.431 21.3033 77.1017C27.8137 50.7721 54.2027 34.6573 80.2365 41.0946C106.27 47.5318 122.108 74.0879 115.598 100.418C109.088 126.747 82.6985 142.862 56.6647 136.425Z"
                      stroke="white"
                    />
                    <circle
                      cx="59.7333"
                      cy="94.0209"
                      r="48.8339"
                      transform="rotate(103.889 59.7333 94.0209)"
                      stroke="white"
                    />
                  </g>
                </svg>
              </div>
              <div className="card-body">
                <div className="title">
                  <svg
                    width="9"
                    height="8"
                    viewBox="0 0 9 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="0.425781" width="8" height="8" fill="#FCFCFC" />
                  </svg>
                  <h4>{d.title}</h4>
                </div>
                <div className="chart-num">
                  <h2>{d.number}</h2>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
