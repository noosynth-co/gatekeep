import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { EVENT, APP_NAME } from "@/lib/constants";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 6,
  },
  logo: {
    width: 80,
    height: 54,
    objectFit: "contain" as const,
  },
  headerText: {
    alignItems: "flex-end",
  },
  appName: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  ticketCode: {
    fontSize: 14,
    color: "#cccccc",
    marginTop: 8,
  },
  eventSection: {
    marginBottom: 30,
  },
  eventName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  eventDetail: {
    fontSize: 12,
    color: "#444444",
    marginBottom: 4,
  },
  ticketInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  infoBlock: {},
  infoLabel: {
    fontSize: 9,
    color: "#888888",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  qrSection: {
    alignItems: "center",
    marginTop: 10,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrNote: {
    fontSize: 10,
    color: "#888888",
    marginTop: 10,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#aaaaaa",
  },
});

interface TicketPDFProps {
  ticketCode: string;
  ticketType: string;
  buyerName: string | null;
  qrDataUrl: string;
  logoDataUrl: string;
}

export function TicketPDF({
  ticketCode,
  ticketType,
  buyerName,
  qrDataUrl,
  logoDataUrl,
}: TicketPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={logoDataUrl} />
          <View style={styles.headerText}>
            <Text style={styles.appName}>{APP_NAME}</Text>
            <Text style={styles.ticketCode}>{ticketCode}</Text>
          </View>
        </View>

        <View style={styles.eventSection}>
          <Text style={styles.eventName}>{EVENT.name}</Text>
          <Text style={styles.eventDetail}>{EVENT.date}</Text>
          <Text style={styles.eventDetail}>{EVENT.venue}</Text>
        </View>

        <View style={styles.ticketInfo}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Ticket Type</Text>
            <Text style={styles.infoValue}>{ticketType}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Attendee</Text>
            <Text style={styles.infoValue}>{buyerName || "—"}</Text>
          </View>
        </View>

        <View style={styles.qrSection}>
          <Image style={styles.qrImage} src={qrDataUrl} />
          <Text style={styles.qrNote}>
            Show this QR code at the entrance gate
          </Text>
        </View>

        <Text style={styles.footer}>
          This ticket is valid for one-time entry only. Do not share this QR
          code.
        </Text>
      </Page>
    </Document>
  );
}
