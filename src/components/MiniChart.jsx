import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const MiniChart = ({ data }) => {
  // Generate sample chart data
  const chartData = {
    labels: ['6h', '4h', '2h', 'Now'],
    datasets: [
      {
        data: [
          data.battery - 10,
          data.battery - 5,
          data.battery - 2,
          data.battery,
        ],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#10B981',
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Battery Level Trend</Text>
      <LineChart
        data={chartData}
        width={width - 64}
        height={120}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withDots={true}
        withShadow={false}
        withScrollableDot={false}
        withInnerLines={false}
        withOuterLines={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  title: {
    fontSize: 14,
    color: '#F3F4F6',
    marginBottom: 8,
    fontWeight: '500',
  },
  chart: {
    borderRadius: 8,
  },
});

export default MiniChart;