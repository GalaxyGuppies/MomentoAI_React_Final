// Centralized config for API base URLs
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://171.240.133.161:32042";
export const DATASTORE_BASE_URL = process.env.EXPO_PUBLIC_DATASTORE_URL || "http://192.168.68.57:8000";

// Centralized API endpoints
export const API_ENDPOINTS = {
	GENERATE: "/generate",
	SUMMARIZE: "/summarize",
	NER: "/ner",
	UPLOAD_IMAGE: "/upload-image",
	ADVANCED_PREPROCESS: "/advanced_preprocess_image",
	IMAGE_YOLO: "/image-yolo",
	CHATBOT_PROCESS: "/chatbot-process",
	SAVE_DATA: "/save_data",
	// Add more endpoints as needed
};