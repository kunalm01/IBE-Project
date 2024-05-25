package com.spring.ibe.constants;

/**
 * This class contains constants for GraphQL queries used in the application.
 */
public class GraphqlQuery {

        private GraphqlQuery() {
        }

        /**
         * GraphQL query to retrieve properties.
         */
        public static final String GET_PROPERTIES = "{ listProperties { property_name } }";

        /**
         * GraphQL query to retrieve nightly rates for a specific property.
         */
        public static final String GET_NIGHTLY_RATES = "{ getProperty(where: {property_id: 11}) { room_type { room_rates "
                        +
                        "{ room_rate { date basic_nightly_rate } } } } }";

        /**
         * GraphQL query to retrieve rooms based on various criteria.
         */
        public static final String GET_ROOMS = "{ listRoomTypes( where: {property_id: {equals: %1$d}, " +
                        "OR: [{room_type_name: {contains: \\\"%2$s\\\"}}], single_bed: {gte: %3$d}, area_in_square_feet: "
                        +
                        "{gte: %4$d}, double_bed: {gte: %5$d}, max_capacity: {gte: %6$d}} ) { area_in_square_feet double_bed "
                        +
                        "max_capacity single_bed room_type_id room_type_name } }";

        /**
         * GraphQL query to retrieve promotions.
         */
        public static final String GET_PROMOTIONS = "{ listPromotions { is_deactivated minimum_days_of_stay " +
                        "price_factor promotion_description promotion_id promotion_title } }";

        /**
         * GraphQL query to retrieve room availabilities within a date range for a
         * property.
         */
        public static final String GET_ROOM_AVAILABILITIES = "{ listRoomAvailabilities( orderBy: {date: ASC} where: " +
                        "{property_id: {equals: %3$d},date: {gte: \\\"%1$sT00:00:00.000Z\\\", lt: \\\"%2$sT00:00:00.000Z\\\"},"
                        +
                        "  booking_id: {equals: 0}} take: 3000 ) { date room { room_id room_type { room_type_name } } } }";

        /**
         * GraphQL query to retrieve room rates within a date range for a property.
         */
        public static final String GET_ROOM_RATES = "{ listRoomRateRoomTypeMappings( where: {room_type: {property_id:" +
                        " {equals: %3$d}}, room_rate: {date: {gte: \\\"%1$sT00:00:00.000Z\\\", lt: \\\"%2$sT00:00:00.000Z\\\"}}}"
                        +
                        " take: 3000 ) { room_rate { basic_nightly_rate date } room_type { room_type_name } } }";

        /**
         * GraphQL query to retrieve room rates within a date range and specific room
         * type for a property.
         */
        public static final String GET_RATES_ROOM_TYPE = "{ listRoomRateRoomTypeMappings( where: {room_rate:" +
                        " {date: {gte: \\\"%1$sT00:00:00.000Z\\\", lt: \\\"%2$sT00:00:00.000Z\\\"}}, room_type_id: " +
                        "{equals: %3$d}, room_type: {property_id: {equals: %4$d}}} orderBy: {room_rate: {date: ASC}} )"
                        +
                        " { room_rate { basic_nightly_rate date } } }";

        /**
         * GraphQL query to retrieve room IDs within a date range and specific room type
         * for a property.
         */
        public static final String GET_ROOM_IDS = "{ listRoomAvailabilities( where: {date: {gte:" +
                        " \\\"%1$sT00:00:00.000Z\\\", lt: \\\"%2$sT00:00:00.000Z\\\"}, room: {room_type_id: {equals: %3$d}},"
                        +
                        " booking_id: {equals: 0}, property_id: {equals: %4$d}} take: 1000 ) { room_id } }";

        /**
         * GraphQL mutation to create a guest.
         */
        public static final String CREATE_GUEST = "mutation { createGuest(data: {guest_name: \\\"%s\\\"}) { guest_id } }";

        /**
         * GraphQL query to retrieve room availabilities within a date range for a
         * specific room in a property.
         */
        public static final String GET_SELECTED_ROOM_AVAILABILITIES = "{ listRoomAvailabilities( where: {date: {gte: \\\"%sT00:00:00.000Z\\\", lt: \\\"%sT00:00:00.000Z\\\"}, property_id: {equals: %d}, room_id: {equals: %d}, booking_id: {equals: 0}} ) { availability_id } }";

        /**
         * GraphQL mutation to create a booking with promotion.
         */
        public static final String CREATE_BOOKING = "mutation { createBooking(data: {check_in_date: \\\"%1$sT00:00:00.000Z\\\", check_out_date: \\\"%2$sT00:00:00.000Z\\\", adult_count: %3$d, child_count: %4$d, total_cost: %5$d, amount_due_at_resort: %6$d, booking_status: {connect: {status_id: %7$d}}, guest: {connect: {guest_id: %8$d}}, promotion_applied: {connect: {promotion_id: %9$d}}, property_booked: {connect: {property_id: %10$d}}, room_booked: {connect: {availability_id: %11$d}}}) { booking_id } }";

        /**
         * GraphQL mutation to create a booking without promotion.
         */
        public static final String CREATE_BOOKING_WITHOUT_PROMOTION = "mutation { createBooking(data: {check_in_date: \\\"%1$sT00:00:00.000Z\\\", check_out_date: \\\"%2$sT00:00:00.000Z\\\", adult_count: %3$d, child_count: %4$d, total_cost: %5$d, amount_due_at_resort: %6$d, booking_status: {connect: {status_id: %7$d}}, guest: {connect: {guest_id: %8$d}}, property_booked: {connect: {property_id: %9$d}}, room_booked: {connect: {availability_id: %10$d}}}) { booking_id } }";

        /**
         * GraphQL mutation to update room availability with a booking.
         */
        public static final String UPDATE_ROOM_AVAILABILITY = "mutation{updateRoomAvailability(where: {availability_id: %1$d} data: {booking: {connect: {booking_id: %2$d}, update: {booking_id: %3$d}}}) { booking_id }}";

        /**
         * GraphQL mutation to update booking status.
         */
        public static final String UPDATE_BOOKING = "mutation { updateBooking(where: {booking_id: %1$d} data: {booking_status: {connect: {status_id: 2}, update: {status_id: 2}}}){ booking_id } }";

        /**
         * GraphQL query to retrieve room availabilities by booking ID.
         */
        public static final String GET_AVAILABILITIES_BY_BOOKING_ID = "query { listRoomAvailabilities(where: {booking_id: {equals: %1$d}}) { availability_id } }";
}
