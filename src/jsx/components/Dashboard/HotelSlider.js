import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";

// SVG paths from public folder
const school = "/images/svg/school.svg";
const wallet = "/images/svg/dash.svg";
const transfer = "/images/svg/wire-transfer.svg";

const smallCard = [
    { image: school, title: "Total Hotel" },
    { image: wallet, title: "Active Hotel" },
    { image: transfer, title: "Inactive Hotel" },
    { image: transfer, title: "Pending Hotel" },
];

const HotelSlider = () => {
    return (
        <Swiper
            className="swiper swiper-container hotel-slider"
            spaceBetween={30}
            slidesPerView={4}
            breakpoints={{
                360: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                },
                600: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                },
                1024: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                },
                1200: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
                1400: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                },
                1920: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                },
            }}
        >
            {smallCard.map((data, index) => (
                <SwiperSlide key={index}>
                    <div className="card">
                        <div className="card-body">
                            <div className="widget-hotels align-items-center d-flex justify-content-between flex-wrap">
                                <div className="d-flex align-items-center flex-wrap">
                                    <img src={data.image} alt="" />
                                    <div className="flex-1 ms-3">
                                        <h4>{data.title}</h4>
                                        {/* <span>Lorem ipsum dolor</span> */}
                                    </div>
                                </div>
                                <Link to={"#"}>
                                    <i className="las la-angle-right text-primary"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default HotelSlider;
