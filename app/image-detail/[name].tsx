import React, { useState, useContext, useEffect } from 'react';
import RNFS from 'react-native-fs';
import { View, Text, ScrollView, Pressable, Modal, FlatList, Alert, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AspectRatioImage from '../../components/AspectRatioImage';
import AnalyticsDetails from '../../components/AnalyticsDetails';
import Share from 'react-native-share';
import { FileContext } from '../../context/FileContext';
import RNCalendarEvents from 'react-native-calendar-events';

export default function ImageDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { name, uuid, uri, analysis } = (route.params || {}) as { name?: string | string[]; uuid?: string; uri?: string; analysis?: any };
  // Example state and props, adjust as needed for your app
  const [file, setFile] = useState<any>(null);
  const [fileInfo, setFileInfo] = useState<any>(null);
  const fileContext = useContext(FileContext);
  const [mainImageUri, setMainImageUri] = useState<string>('');
  const [fileExists, setFileExists] = useState<boolean>(false);
  const [moveModalVisible, setMoveModalVisible] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [displayCategory, setDisplayCategory] = useState<string>('');
  const [displaySubcategory, setDisplaySubcategory] = useState<string>('');
  const [displayCategories, setDisplayCategories] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]); // Replace with actual files list
  const [imageFields, setImageFields] = useState<any[]>([]); // Replace with actual image fields
  const [analyticsFields, setAnalyticsFields] = useState<any[]>([]); // Replace with actual analytics fields

  // On mount or when files/context change, find the file by uuid or name
  useEffect(() => {
    if (!fileContext || !fileContext.files) return;
    let found = null;
    if (uuid) {
      found = fileContext.files.find(f => f.uuid === uuid);
    }
    if (!found && name) {
      found = fileContext.files.find(f => f.uri && f.uri.includes(name as string));
    }
    if (found) {
      setFile(found);
  setFileInfo((found as any)?.metadata ? (found as any).metadata : found);
      // Set main image URI
      let uri = '';
      if (found.uri && found.uri.startsWith('http')) {
        uri = found.uri;
      } else if (found.processed && found.processed.startsWith('http')) {
        uri = found.processed;
      } else if (found.uri) {
        uri = found.uri;
      } else if (typeof uuid === 'string' && uuid.length > 0) {
        uri = `file:///data/user/0/Momento.Ai/cache/ImagePicker/${uuid}.jpeg`;
      }
      setMainImageUri(uri);
      if (uri.startsWith('file://')) {
        RNFS.exists(uri).then(exists => {
          setFileExists(exists);
        });
      } else {
        setFileExists(!!uri);
      }
    }
  }, [fileContext, uuid, name]);

  // Navigation logic
  function goToPrevImage() {
    // ...implement previous image navigation...
  }
  function goToNextImage() {
    // ...implement next image navigation...
  }
  async function handleShare() {
    if (mainImageUri && (mainImageUri.startsWith('http') || mainImageUri.startsWith('file'))) {
      try {
        await Share.open({ url: mainImageUri });
      } catch (err) {
        Alert.alert('Error', 'Unable to share image.');
      }
    }
  }
  function handleDelete() {
    Alert.alert('Delete Image', 'Are you sure you want to delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (file?.uri) {
          // ...delete logic...
          Alert.alert('Deleted', 'Image deleted.');
          navigation.goBack();
        }
      } }
    ]);
  }
  const [dateChoiceModalVisible, setDateChoiceModalVisible] = useState(false);
  const [dateChoices, setDateChoices] = useState<{label: string, start: Date, end?: Date}[]>([]);
  const [pendingCalendarDetails, setPendingCalendarDetails] = useState<any>(null);

  async function addToDeviceCalendar() {
    // Use analytics/analysis fields if available
    const analytics = file?.analytics || {};
    const analysis = file?.analysis || {};
    // Prefer analytics date/time/location, fallback to descriptive
    let eventTitle = (analysis.labels && analysis.labels.length > 0) ? analysis.labels[0] : 'Imported Event';
    let eventLocation = analytics.location || undefined;
    let eventNotes = analysis.extractedText || '';
  let startDate: Date | undefined = undefined;
  let endDate: Date | undefined = undefined;
    console.log('[Calendar Debug] analytics:', analytics);
    console.log('[Calendar Debug] analysis:', analysis);

    // Helper: Try to parse a date and time from a string using multiple patterns, including relative dates and ranges
    type ParsedDateResult = {
      date?: Date,
      timeMatch?: RegExpMatchArray,
      range?: { start: Date, end: Date },
      allDates?: { label: string, start: Date, end?: Date, timeMatch?: RegExpMatchArray }[]
    };

    function tryParseDateTimeFromText(text: string): ParsedDateResult {
      // 00. ISO 8601 and RFC 2822 formats (extract all matches)
      const isoRfcPatterns = [
        /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?\b/g, // 2025-09-11T14:30 or 2025-09-11T14:30:00Z
        /\b\d{4}-\d{2}-\d{2}\b/g, // 2025-09-11
        /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),? \d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}(?::\d{2})? ?(GMT|UTC|[+-]\d{4})?\b/gi // RFC 2822
      ];
      let allDates: {label: string, start: Date, end?: Date, timeMatch?: RegExpMatchArray}[] = [];
      for (const pattern of isoRfcPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const parsed = Date.parse(match[0]);
          if (!isNaN(parsed)) {
            allDates.push({ label: match[0], start: new Date(parsed) });
          }
        }
      }
      if (!text) return {};
      // 0. Date range patterns (extract all matches)
      const rangePatterns = [
        /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s,]+(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})(?:,?\s*(\d{4}))?\b/gi,
        /\b(\d{1,2})[\/\-](\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/g,
        /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2}),?\s*(\d{4})\b/gi,
      ];
      for (const pattern of rangePatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          try {
            let start: Date | undefined = undefined;
            let end: Date | undefined = undefined;
            if (pattern === rangePatterns[0]) {
              let month = match[1];
              let d1 = parseInt(match[2], 10);
              let d2 = parseInt(match[3], 10);
              let y = match[4] ? parseInt(match[4], 10) : new Date().getFullYear();
              start = new Date(`${month} ${d1}, ${y}`);
              end = new Date(`${month} ${d2}, ${y}`);
            } else if (pattern === rangePatterns[1]) {
              let m1 = parseInt(match[1], 10);
              let d1 = parseInt(match[2], 10);
              let m2 = parseInt(match[3], 10);
              let d2 = parseInt(match[4], 10);
              let y = match[5] ? parseInt(match[5], 10) : new Date().getFullYear();
              start = new Date(y, m1 - 1, d1);
              end = new Date(y, m2 - 1, d2);
            } else if (pattern === rangePatterns[2]) {
              let month = match[1];
              let d1 = parseInt(match[2], 10);
              let d2 = parseInt(match[3], 10);
              let y = parseInt(match[4], 10);
              start = new Date(`${month} ${d1}, ${y}`);
              end = new Date(`${month} ${d2}, ${y}`);
            }
            if (start && end) {
              let timeMatch = text.match(/(\d{1,2}):(\d{2})(?:\s?([APMapm]{2}))?|\b(\d{1,2})\s?([APMapm]{2})\b/);
              allDates.push({ label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, start, end, timeMatch: timeMatch || undefined });
            }
          } catch (e) { continue; }
        }
      }
      // 1. Relative date patterns (extract all matches)
      const now = new Date();
      const relPatterns = [
        { regex: /\btoday\b/gi, getDate: () => new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
        { regex: /\btomorrow\b/gi, getDate: () => new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) },
        { regex: /\byesterday\b/gi, getDate: () => new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1) },
        { regex: /\bin (\d+) days?\b/gi, getDate: (m: RegExpMatchArray) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + parseInt(m[1], 10)) },
        { regex: /\bin (\d+) weeks?\b/gi, getDate: (m: RegExpMatchArray) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7 * parseInt(m[1], 10)) },
        { regex: /\bnext (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, getDate: (m: RegExpMatchArray) => {
          const daysOfWeek = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
          const target = daysOfWeek.indexOf(m[1].toLowerCase());
          let day = now.getDay();
          let diff = (target + 7 - day) % 7;
          if (diff === 0) diff = 7;
          return new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
        }},
      ];
      for (const rel of relPatterns) {
        let match;
        while ((match = rel.regex.exec(text)) !== null) {
          let date = rel.getDate(match);
          let timeMatch = text.match(/(\d{1,2}):(\d{2})(?:\s?([APMapm]{2}))?|\b(\d{1,2})\s?([APMapm]{2})\b/);
          allDates.push({ label: match[0], start: date, timeMatch: timeMatch || undefined });
        }
      }
      // 2. Robust combined date+time patterns (extract all matches)
      const combinedPatterns = [
        /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s,]+(\d{1,2})(?:,?\s*(\d{4}))?[\s,]+(\d{1,2})[:\.]?(\d{2})?\s*([APMapm]{2})\b/gi,
        /\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?[\s,]+(\d{1,2})[:\.]?(\d{2})?\s*([APMapm]{2})\b/gi
      ];
      for (const pattern of combinedPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          try {
            if (pattern === combinedPatterns[0]) {
              let monthStr = match[1];
              let d = parseInt(match[2], 10);
              let y = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
              let hour = parseInt(match[4], 10);
              let minute = match[5] ? parseInt(match[5], 10) : 0;
              let ampm = match[6];
              if (d < 1 || d > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) continue;
              let date = new Date(`${monthStr} ${d}, ${y}`);
              if (ampm) {
                if (/pm/i.test(ampm) && hour < 12) hour += 12;
                if (/am/i.test(ampm) && hour === 12) hour = 0;
              }
              date.setHours(hour, minute, 0, 0);
              allDates.push({ label: match[0], start: date });
            } else if (pattern === combinedPatterns[1]) {
              let m = parseInt(match[1], 10);
              let d = parseInt(match[2], 10);
              let y = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
              let hour = parseInt(match[4], 10);
              let minute = match[5] ? parseInt(match[5], 10) : 0;
              let ampm = match[6];
              if (m < 1 || m > 12 || d < 1 || d > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) continue;
              let date = new Date(y, m - 1, d);
              if (ampm) {
                if (/pm/i.test(ampm) && hour < 12) hour += 12;
                if (/am/i.test(ampm) && hour === 12) hour = 0;
              }
              date.setHours(hour, minute, 0, 0);
              allDates.push({ label: match[0], start: date });
            }
          } catch (e) { continue; }
        }
      }
      // 3. Common date regex patterns (extract all matches)
      const patterns = [
        /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/g,
        /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/g,
        /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s*(\d{4})\b/gi,
        /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December),?\s*(\d{4})\b/gi,
        /\b(\d{1,2})[\/\-](\d{1,2})\b/g,
      ];
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          try {
            if (pattern === patterns[0]) {
              let m = parseInt(match[1], 10);
              let d = parseInt(match[2], 10);
              let y = parseInt(match[3], 10);
              if (y < 100) y += 2000;
              if (m > 12) [m, d] = [d, m];
              allDates.push({ label: match[0], start: new Date(y, m - 1, d) });
            } else if (pattern === patterns[1]) {
              let y = parseInt(match[1], 10);
              let m = parseInt(match[2], 10);
              let d = parseInt(match[3], 10);
              allDates.push({ label: match[0], start: new Date(y, m - 1, d) });
            } else if (pattern === patterns[2]) {
              let month = match[1];
              let d = parseInt(match[2], 10);
              let y = parseInt(match[3], 10);
              allDates.push({ label: match[0], start: new Date(`${month} ${d}, ${y}`) });
            } else if (pattern === patterns[3]) {
              let d = parseInt(match[1], 10);
              let month = match[2];
              let y = parseInt(match[3], 10);
              allDates.push({ label: match[0], start: new Date(`${month} ${d}, ${y}`) });
            } else if (pattern === patterns[4]) {
              let m = parseInt(match[1], 10);
              let d = parseInt(match[2], 10);
              let y = new Date().getFullYear();
              allDates.push({ label: match[0], start: new Date(y, m - 1, d) });
            }
          } catch (e) { continue; }
        }
      }
      // If multiple dates found, return all for UI selection
      if (allDates.length > 0) {
        return { allDates };
      }
      // fallback if nothing found
      return {};
    }

    // 1. Try to parse from extractedText first
    let parsedFromText = analysis.extractedText ? tryParseDateTimeFromText(analysis.extractedText) : {};
    // If multiple dates found, prompt user to choose
    if (parsedFromText.allDates && parsedFromText.allDates.length > 0) {
      setDateChoices(parsedFromText.allDates);
      setPendingCalendarDetails({ eventTitle, eventLocation, eventNotes, parsedFromText });
      setDateChoiceModalVisible(true);
      return;
    }
    // If a range is found, prompt user to choose start or range
    if (parsedFromText.range) {
      const { start, end } = parsedFromText.range;
      const choices = [
        { label: `Start Only: ${start.toLocaleDateString()}`, start },
        { label: `End Only: ${end.toLocaleDateString()}`, start: end },
        { label: `Full Range: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, start, end },
      ];
      setDateChoices(choices);
      setPendingCalendarDetails({ eventTitle, eventLocation, eventNotes, parsedFromText });
      setDateChoiceModalVisible(true);
      return;
    }
    if (parsedFromText.date) {
      startDate = parsedFromText.date;
      // If time found, set it
      if (parsedFromText.timeMatch) {
        let hour = 0, minute = 0;
        let ampm = undefined;
        if (parsedFromText.timeMatch[1] && parsedFromText.timeMatch[2]) {
          hour = parseInt(parsedFromText.timeMatch[1], 10);
          minute = parseInt(parsedFromText.timeMatch[2], 10);
          ampm = parsedFromText.timeMatch[3];
        } else if (parsedFromText.timeMatch[4] && parsedFromText.timeMatch[5]) {
          hour = parseInt(parsedFromText.timeMatch[4], 10);
          minute = 0;
          ampm = parsedFromText.timeMatch[5];
        }
        if (ampm) {
          if (/pm/i.test(ampm) && hour < 12) hour += 12;
          if (/am/i.test(ampm) && hour === 12) hour = 0;
        }
        startDate.setHours(hour, minute, 0, 0);
      }
      console.log('[Calendar Debug] Parsed date/time from extractedText:', analysis.extractedText, '->', startDate);
    }
    // 2. If not found, try analytics.date
    if (!startDate && analytics.date) {
      let parsedDate = Date.parse(analytics.date);
      console.log('[Calendar Debug] Parsed date:', analytics.date, '->', parsedDate);
      if (!isNaN(parsedDate)) {
        startDate = new Date(parsedDate);
        // If analytics.time is available, set it
        if (analytics.time) {
          let timeMatch = analytics.time.match(/(\d{1,2}):(\d{2})(?:\s?([APMapm]{2}))?/);
          console.log('[Calendar Debug] Parsed time:', analytics.time, '->', timeMatch);
          if (timeMatch) {
            let hour = parseInt(timeMatch[1], 10);
            let minute = parseInt(timeMatch[2], 10);
            let ampm = timeMatch[3];
            if (ampm) {
              if (/pm/i.test(ampm) && hour < 12) hour += 12;
              if (/am/i.test(ampm) && hour === 12) hour = 0;
            }
            startDate.setHours(hour, minute, 0, 0);
          }
        }
      }
    }
    if (startDate) {
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    }
    console.log('[Calendar Debug] Event details:', { eventTitle, eventLocation, eventNotes, startDate, endDate });

    // Request calendar permissions
    let status = await RNCalendarEvents.requestPermissions();
    console.log('[Calendar Debug] Calendar permission status:', status);
    if (status !== 'authorized') {
      Alert.alert('Permission required', 'Calendar permission is required to add events.');
      return;
    }

    // Get default calendar
    const calendars = await RNCalendarEvents.findCalendars();
    console.log('[Calendar Debug] Device calendars:', calendars);
    const defaultCalendar = calendars.find((cal: any) => cal.allowsModifications) || calendars[0];
    if (!defaultCalendar) {
      Alert.alert('No calendar found', 'No modifiable calendar found on device.');
      return;
    }
    console.log('[Calendar Debug] Using calendar:', defaultCalendar);

    // Create event
    try {
      const eventId = await RNCalendarEvents.saveEvent(eventTitle, {
        calendarId: defaultCalendar.id,
        location: eventLocation,
        notes: eventNotes,
        startDate: (startDate || new Date()).toISOString(),
        endDate: (endDate || new Date(Date.now() + 60 * 60 * 1000)).toISOString(),
      });
      console.log('[Calendar Debug] Event created with ID:', eventId);
      Alert.alert('Event added!', `Event created in your calendar.`);
    } catch (err) {
      console.error('[Calendar Debug] Error creating event:', err);
      Alert.alert('Error', 'Failed to add event to calendar.');
    }

  // Handler for user date choice from modal
  const handleDateChoice = async (choice: {label: string, start: Date, end?: Date}) => {
    setDateChoiceModalVisible(false);
    if (!pendingCalendarDetails) return;
    let { eventTitle, eventLocation, eventNotes, parsedFromText } = pendingCalendarDetails;
    let startDate = choice.start;
    let endDate = choice.end ? choice.end : new Date(startDate.getTime() + 60 * 60 * 1000);
    // If time found, set it on startDate
    if (parsedFromText.timeMatch) {
      let hour = 0, minute = 0;
      let ampm = undefined;
      if (parsedFromText.timeMatch[1] && parsedFromText.timeMatch[2]) {
        hour = parseInt(parsedFromText.timeMatch[1], 10);
        minute = parseInt(parsedFromText.timeMatch[2], 10);
        ampm = parsedFromText.timeMatch[3];
      } else if (parsedFromText.timeMatch[4] && parsedFromText.timeMatch[5]) {
        hour = parseInt(parsedFromText.timeMatch[4], 10);
        minute = 0;
        ampm = parsedFromText.timeMatch[5];
      }
      if (ampm) {
        if (/pm/i.test(ampm) && hour < 12) hour += 12;
        if (/am/i.test(ampm) && hour === 12) hour = 0;
      }
      startDate.setHours(hour, minute, 0, 0);
    }
    // Request calendar permissions
    let status = await RNCalendarEvents.requestPermissions();
    if (status !== 'authorized') {
      Alert.alert('Permission required', 'Calendar permission is required to add events.');
      return;
    }
    // Get default calendar
    const calendars = await RNCalendarEvents.findCalendars();
    const defaultCalendar = calendars.find((cal: any) => cal.allowsModifications) || calendars[0];
    if (!defaultCalendar) {
      Alert.alert('No calendar found', 'No modifiable calendar found on device.');
      return;
    }
    try {
      const eventId = await RNCalendarEvents.saveEvent(eventTitle, {
        calendarId: defaultCalendar.id,
        location: eventLocation,
        notes: eventNotes,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      Alert.alert('Event added!', `Event created in your calendar.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to add event to calendar.');
    }
    setPendingCalendarDetails(null);
  };

  async function moveFile(fileUuid: string, category: string) {
    if (!fileContext || !fileContext.moveFile) {
      Alert.alert('Error', 'Move file functionality is not available.');
      return;
    }
    try {
      await fileContext.moveFile(fileUuid, [category]);
      Alert.alert('Success', 'File moved successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to move file.');
    }
  }
  }
  function renderImage(uri: string, label: string) {
    return (
      <View key={uri} style={{ marginBottom: 8 }}>
        <AspectRatioImage uri={uri} maxWidth={120} maxHeight={120} style={{ borderRadius: 8 }} />
        <Text style={{ textAlign: 'center', marginTop: 4 }}>{label}</Text>
      </View>
    );
  }

  // Handler for user date choice from modal
  const handleDateChoice = async (choice: {label: string, start: Date, end?: Date}) => {
    setDateChoiceModalVisible(false);
    if (!pendingCalendarDetails) return;
    let { eventTitle, eventLocation, eventNotes, parsedFromText } = pendingCalendarDetails;
    let startDate = choice.start;
    let endDate = choice.end ? choice.end : new Date(startDate.getTime() + 60 * 60 * 1000);
    // If time found, set it on startDate
    if (parsedFromText.timeMatch) {
      let hour = 0, minute = 0;
      let ampm = undefined;
      if (parsedFromText.timeMatch[1] && parsedFromText.timeMatch[2]) {
        hour = parseInt(parsedFromText.timeMatch[1], 10);
        minute = parseInt(parsedFromText.timeMatch[2], 10);
        ampm = parsedFromText.timeMatch[3];
      } else if (parsedFromText.timeMatch[4] && parsedFromText.timeMatch[5]) {
        hour = parseInt(parsedFromText.timeMatch[4], 10);
        minute = 0;
        ampm = parsedFromText.timeMatch[5];
      }
      if (ampm) {
        if (/pm/i.test(ampm) && hour < 12) hour += 12;
        if (/am/i.test(ampm) && hour === 12) hour = 0;
      }
      startDate.setHours(hour, minute, 0, 0);
    }
    // Request calendar permissions
    let status = await RNCalendarEvents.requestPermissions();
    if (status !== 'authorized') {
      Alert.alert('Permission required', 'Calendar permission is required to add events.');
      return;
    }
    // Get default calendar
    const calendars = await RNCalendarEvents.findCalendars();
    const defaultCalendar = calendars.find((cal: any) => cal.allowsModifications) || calendars[0];
    if (!defaultCalendar) {
      Alert.alert('No calendar found', 'No modifiable calendar found on device.');
      return;
    }
    try {
      const eventId = await RNCalendarEvents.saveEvent(eventTitle, {
        calendarId: defaultCalendar.id,
        location: eventLocation,
        notes: eventNotes,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      Alert.alert('Event added!', `Event created in your calendar.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to add event to calendar.');
    }
    setPendingCalendarDetails(null);
  };

  async function moveFile(fileUuid: string, category: string) {
    if (!fileContext || !fileContext.moveFile) {
      Alert.alert('Error', 'Move file functionality is not available.');
      return;
    }
    try {
      await fileContext.moveFile(fileUuid, [category]);
      Alert.alert('Success', 'File moved successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to move file.');
    }
  }

  return (
    <>
      <Modal visible={dateChoiceModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, minWidth: 280 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16, textAlign: 'center' }}>Choose Date for Event</Text>
            {dateChoices.map((choice, idx) => (
              <Pressable key={idx} style={{ padding: 12, borderRadius: 8, backgroundColor: '#4285F4', marginBottom: 10 }} onPress={() => handleDateChoice(choice)}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{choice.label}</Text>
              </Pressable>
            ))}
            <Pressable style={{ marginTop: 8 }} onPress={() => setDateChoiceModalVisible(false)}>
              <Text style={{ color: '#007aff', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, backgroundColor: '#fafbfc' }}>
  {/* Main Image Section */}
  <View style={{ alignItems: 'center', marginBottom: 24, position: 'relative' }}>
        {mainImageUri ? (
          <AspectRatioImage
            uri={mainImageUri}
            maxWidth={340}
            maxHeight={340}
            style={{
              borderRadius: 16,
              backgroundColor: '#f5f5f5',
              borderWidth: 2,
              borderColor: '#e3f2fd',
            }}
          />
        ) : (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 340,
              width: 340,
              backgroundColor: '#eee',
              borderRadius: 16,
              borderWidth: 2,
              borderColor: '#ffcdd2',
            }}
          >
            <Text style={{ color: '#e53935', fontWeight: 'bold', fontSize: 18 }}>Image not found</Text>
            <Text style={{ fontSize: 12, color: '#333', marginTop: 8 }}>[Debug] mainImageUri:</Text>
            {mainImageUri && mainImageUri.startsWith('http') ? (
              <Text
                style={{ color: '#1976d2', textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL(mainImageUri)}
              >
                {mainImageUri}
              </Text>
            ) : (
              <Text style={{ color: '#333' }}>{mainImageUri}</Text>
            )}
            {file && (
              <Text style={{ fontSize: 12, color: '#333', marginTop: 4 }}>
                [Debug] file: {JSON.stringify(file, null, 2)}
              </Text>
            )}
            {fileInfo && (
              <Text style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
                [Debug] File Info: {JSON.stringify(fileInfo, null, 2)}
              </Text>
            )}
          </View>
        )}
        {/* Icon Buttons Row - now placed below the image */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
          <Pressable onPress={goToPrevImage} style={{ marginHorizontal: 8 }} accessibilityLabel="Previous image">
            <Text style={{ fontSize: 22, color: '#1976d2' }}>‹</Text>
          </Pressable>
          <Pressable onPress={handleShare} style={{ marginHorizontal: 8 }} accessibilityLabel="Share image">
            <Text style={{ fontSize: 18, color: '#388e3c' }}>🔗</Text>
          </Pressable>
          <Pressable onPress={addToDeviceCalendar} style={{ marginHorizontal: 8 }} accessibilityLabel="Add to calendar">
            <Text style={{ fontSize: 18, color: '#f4b400' }}>📅</Text>
          </Pressable>
          <Pressable onPress={handleDelete} style={{ marginHorizontal: 8 }} accessibilityLabel="Delete image">
            <Text style={{ fontSize: 18, color: '#e53935' }}>🗑️</Text>
          </Pressable>
          <Pressable onPress={goToNextImage} style={{ marginHorizontal: 8 }} accessibilityLabel="Next image">
            <Text style={{ fontSize: 22, color: '#1976d2' }}>›</Text>
          </Pressable>
        </View>
        {/* Loading/Spinner and Error States */}
      </View>


      {/* Analytics Section (now below important info) */}
      <View style={{ marginBottom: 24, padding: 18, backgroundColor: '#c8e6c9', borderRadius: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#388e3c' }}>Extracted Details</Text>
        <AnalyticsDetails analytics={file?.analytics} analysis={file?.analysis} />
      </View>

      {/* Administrative Metadata */}
      {fileInfo?.administrative ? (
        <View style={{ marginBottom: 10, padding: 18, backgroundColor: '#e1f5fe', borderRadius: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Administrative</Text>
          <Text style={{ fontSize: 14, color: '#333' }}>Imported By: {fileInfo.administrative.importedBy || 'N/A'}</Text>
          <Text style={{ fontSize: 14, color: '#333' }}>Import Timestamp: {fileInfo.administrative.importTimestamp ? new Date(fileInfo.administrative.importTimestamp).toLocaleString() : 'N/A'}</Text>
          <Text style={{ fontSize: 14, color: '#333' }}>UUID: {fileInfo.administrative.uuid || 'N/A'}</Text>
        </View>
      ) : null}

      {/* Contextual Metadata */}
      {fileInfo?.contextual ? (
        <View style={{ marginBottom: 10, padding: 18, backgroundColor: '#e1f5fe', borderRadius: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Contextual</Text>
          <Text style={{ fontSize: 14, color: '#333' }}>Previous Corrections: {Array.isArray(fileInfo.contextual.previousCorrections) ? fileInfo.contextual.previousCorrections.join(', ') : 'N/A'}</Text>
        </View>
      ) : null}

      {/* Technical Metadata (now at the bottom) */}
      <View style={{ marginBottom: 24, padding: 18, backgroundColor: '#e3f2fd', borderRadius: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#1976d2' }}>Technical Metadata</Text>
        {fileInfo?.technical ? (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Technical</Text>
            <Text style={{ fontSize: 14, color: '#333' }}>Created At: {fileInfo.technical.createdAt ? new Date(fileInfo.technical.createdAt).toLocaleString() : 'N/A'}</Text>
            <Text style={{ fontSize: 14, color: '#333' }}>Device: {fileInfo.technical.device || 'N/A'}</Text>
            <Text style={{ fontSize: 14, color: '#333' }}>Size: {fileInfo.technical.size ? `${(fileInfo.technical.size / 1024).toFixed(1)} KB` : 'N/A'}</Text>
            <Text style={{ fontSize: 14, color: '#333' }}>Type: {fileInfo.technical.type || 'N/A'}</Text>
          </View>
        ) : (
          <Text style={{ fontSize: 14, color: '#333', marginBottom: 10 }}>No technical metadata available.</Text>
        )}
      </View>
    </ScrollView>
    </>
  );
}