import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

//import "swiper/css";
import { Autoplay, Navigation, Pagination } from "swiper";

//images
import image1 from "./../../../images/1.jpg";
import image2 from "./../../../images/2.jpg";
import image3 from "./../../../images/3.jpg";

const sliderData = [
    { image: image1, title: "Exca Libur" },
    { image: image2, title: "Talan Siphron" },
    { image: image3, title: "Thomas Khun" },
];

export default function ReviewsSlider() {
    const swiperRef = useRef();
    return (
        <>
            <Swiper
                className="mySwiper position-relative"
                speed={1500}
                parallax={true}
                slidesPerView={3}
                spaceBetween={30}
                loop={true}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                }}
                modules={[Autoplay, Navigation, Pagination]}
                breakpoints={{
                    300: {
                        slidesPerView: 1,
                        spaceBetween: 20,
                    },
                    991: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                    },
                    1200: {
                        slidesPerView: 3,
                        spaceBetween: 20,
                    },
                }}
            >
                {sliderData.map((d, i) => (
                    <SwiperSlide key={i}>
                        <div className="card">
                            <div className="card-header justify-content-start border-0 pb-0 p-4">
                                <div className="slide-img me-3">
                                    <img src={d.image} className="img-fluid" alt="" />
                                </div>
                                <div>
                                    <h4>{d.title}</h4>
                                    <span>
                                        UI Designer /{" "}
                                        <span>
                                            <svg
                                                width="17"
                                                height="15"
                                                viewBox="0 0 17 15"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M8.5 0.5L10.2961 6.02786H16.1085L11.4062 9.44427L13.2023 14.9721L8.5 11.5557L3.79772 14.9721L5.59383 9.44427L0.891548 6.02786H6.70389L8.5 0.5Z"
                                                    fill="#FFD125"
                                                />
                                            </svg>{" "}
                                            5.0
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div className="card-body p-4">
                                <p className="mb-0">
                                    Sed eligendi facere repellendus. Ipsam ipsam incidunt minima
                                    harum tenetur. Ab sit asperiores architecto repudiandae.
                                </p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
                <div className="">
                    <div
                        className="swiper-button-next"
                        onClick={() => swiperRef.current.slideNext()}
                    >
                        <svg
                            width="16"
                            height="12"
                            viewBox="0 0 16 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M10.8163 11.3757L15.3283 6.83173C15.3923 6.76773 15.4243 6.70373 15.4883 6.63973C15.5203 6.60773 15.5203 6.57573 15.5523 6.54373C15.5843 6.51173 15.5843 6.47973 15.6163 6.41573C15.6163 6.38373 15.6483 6.35173 15.6483 6.28773C15.6483 6.25573 15.6803 6.22373 15.6803 6.19173L15.6803 5.99973C15.6803 5.93573 15.6803 5.83973 15.6483 5.77573C15.6483 5.74373 15.6163 5.71173 15.6163 5.67973C15.6163 5.64773 15.5843 5.61573 15.5843 5.58373C15.5843 5.55173 15.5523 5.51973 15.5203 5.48773C15.5203 5.39173 15.4883 5.35973 15.4883 5.35973C15.4563 5.29573 15.3923 5.23173 15.3283 5.16773L10.8163 0.623728C10.5923 0.399728 10.3043 0.271728 9.9843 0.271728C9.6643 0.271728 9.3763 0.399728 9.1523 0.623728C8.9283 0.847728 8.80029 1.13573 8.80029 1.45573C8.80029 1.77573 8.9283 2.06373 9.1523 2.28773L11.6483 4.78373L1.50429 4.78373C0.864291 4.78373 0.320291 5.32773 0.320291 5.96773C0.320291 6.60773 0.864291 7.15173 1.50429 7.15173L11.6483 7.15173L9.15229 9.64773C8.92829 9.87173 8.80029 10.1597 8.80029 10.4797C8.80029 10.7997 8.92829 11.0877 9.15229 11.3117C9.37629 11.5357 9.66429 11.6637 9.98429 11.6637C10.2723 11.6957 10.5923 11.5997 10.8163 11.3757Z"
                                fill="#FCFCFC"
                            />
                        </svg>
                    </div>
                    <div
                        className="swiper-button-prev"
                        onClick={() => swiperRef.current.slidePrev()}
                    >
                        <svg
                            width="16"
                            height="12"
                            viewBox="0 0 16 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M5.1837 0.624268L0.671702 5.16827C0.607702 5.23227 0.575702 5.29627 0.511702 5.36027C0.479702 5.39227 0.479702 5.42427 0.447702 5.45627C0.415702 5.48827 0.415702 5.52027 0.383702 5.58427C0.383702 5.61627 0.351702 5.64827 0.351702 5.71227C0.351702 5.74427 0.319702 5.77627 0.319702 5.80827L0.319702 6.00027C0.319702 6.06427 0.319702 6.16027 0.351702 6.22427C0.351702 6.25627 0.383702 6.28827 0.383702 6.32027C0.383702 6.35227 0.415702 6.38427 0.415702 6.41627C0.415702 6.44827 0.447702 6.48027 0.479702 6.51227C0.479702 6.60827 0.511702 6.64027 0.511702 6.64027C0.543702 6.70427 0.607702 6.76827 0.671702 6.83227L5.1837 11.3763C5.4077 11.6003 5.6957 11.7283 6.0157 11.7283C6.3357 11.7283 6.6237 11.6003 6.8477 11.3763C7.0717 11.1523 7.19971 10.8643 7.19971 10.5443C7.19971 10.2243 7.0717 9.93627 6.8477 9.71227L4.3517 7.21627L14.4957 7.21627C15.1357 7.21627 15.6797 6.67227 15.6797 6.03227C15.6797 5.39227 15.1357 4.84827 14.4957 4.84827L4.3517 4.84827L6.8477 2.35227C7.0717 2.12827 7.1997 1.84027 7.1997 1.52027C7.1997 1.20027 7.0717 0.912268 6.8477 0.688268C6.6237 0.464268 6.3357 0.336267 6.0157 0.336267C5.7277 0.304268 5.4077 0.400268 5.1837 0.624268Z"
                                fill="#FCFCFC"
                            />
                        </svg>
                    </div>
                </div>
            </Swiper>
        </>
    );
}
