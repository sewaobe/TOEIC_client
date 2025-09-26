import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";

interface KpiItem {
  title: string;
  value: string | number;
  sub: string;
}

export const KpiStrip: React.FC<{ kpi: KpiItem[] }> = ({ kpi }) => (
  <Grid container spacing={2} sx={{ mb: 2 }}>
    {kpi.map((x, i) => (
      <Grid key={i} size={{xs:12, md:4}}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">{x.sub}</Typography>
            <Typography variant="h5" fontWeight={800}>{x.value}</Typography>
            <Typography variant="body2">{x.title}</Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);
