import ChatBot from "react-simple-chatbot";
import "./Chatbot.scss";

export function Chatbot() {
  return (
    <ChatBot
      headerTitle="KickBot (Internet Booking Engine)"
      botAvatar="/images/bot.webp"
      userAvatar="/images/user.webp"
      floating
      hideInput
      inputStyle={{ display: "none" }}
      submitButtonStyle={{ display: "none" }}
      steps={[
        {
          id: "1",
          message:
            "Hello User, Welcome to Internet Booking Engine! My name is Kick-Bot, How may I assist you?",
          trigger: "2",
          hideInput: true,
        },
        {
          id: "2",
          options: [
            { value: 1, label: "Login", trigger: "6" },
            { value: 2, label: "Search Rooms", trigger: "7" },
            { value: 3, label: "Select a Room", trigger: "8" },
            { value: 4, label: "Book a Room", trigger: "9" },
            { value: 5, label: "Read Reviews", trigger: "10" },
            { value: 6, label: "View My Bookings", trigger: "11" },
            { value: 7, label: "View My Subscription", trigger: "12" },
            { value: 8, label: "Language/Currency Change", trigger: "13" },
          ],
          hideInput: true,
        },
        {
          id: "3",
          message: "Select from the options below to get assistance.",
          trigger: "2",
          hideInput: true,
        },
        {
          id: "4",
          options: [
            { value: 1, label: "End Chat", trigger: "5" },
            { value: 2, label: "Return to Menu", trigger: "3" },
          ],
          hideInput: true,
        },
        {
          id: "5",
          message:
            "Glad to know that your query was resolved. If you need assistance with anything else, feel free to reach out. I'm here to help!",
          trigger: "14",
          hideInput: true,
        },
        {
          id: "14",
          options: [{ value: 1, label: "Need More Help?", trigger: "2" }],
          hideInput: true,
        },
        {
          id: "6",
          message:
            "You can find the login button on the top right corner of the header. Click on it to login or sign up for an account.",
          trigger: "4",
          hideInput: true,
        },
        {
          id: "7",
          message:
            "On the Landing Page fill the Search Form as per your preferences and click on Search button, You will be redirected to Room Results Page showing all rooms available.",
          trigger: "4",
          hideInput: true,
        },
        {
          id: "8",
          message:
            "Search Rooms -> On the Room Results Page, Select a room from the available options by clicking Select Room button which will open Room Modal. Select any package of your choice you will be redirected to Checkout Page.",
          trigger: "4",
          hideInput: true,
        },
        {
          id: "9",
          message:
            "Search Rooms -> Select a Room -> On the Checkout Page, fill in all the required details precisely and click on Purchase. On successful booking you will be redirected to Booking Page.",
          trigger: "4",
          hideInput: true,
        },
        {
          id: "10",
          message:
            "Search Rooms -> Select a Room -> On the Room Modal you can read reviews from other guests to get insights about their experiences.",
          trigger: "4",
          hideInput: true,
        },
        {
          id: "11",
          message:
            "View your past bookings and upcoming reservations by clicking on My Bookings button in the header.",
          trigger: "4",
          hideInput: true,
        },
        {
          id: "12",
          message:
            "View your current subscription plan by clicking on the icon in the header.",
          trigger: "4",
          hideInput: true,
        },
        {
          id: "13",
          message:
            "You can change language/currency by clicking on the options available in the header.",
          trigger: "4",
          hideInput: true,
        },
      ]}
    />
  );
}
